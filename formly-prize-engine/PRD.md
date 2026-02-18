# PRD — formly-prize-engine (MVP)

## 1. Resumen

`formly-prize-engine` es un microservicio backend-only en Next.js 16.1.6 + TypeScript + Supabase que gestiona la creación, locking, distribución y auditoría de premios para formularios. Soporta tres tipos de recompensa (XLM, USDC, POINTS) y dos modos de distribución (LOTTERY_SINGLE, SPLIT_EQUAL). El servicio es consumido por "core" y no expone frontend; toda la UX se refleja vía API REST con estados claros y proofs on-chain/off-chain.

---

## 2. Objetivos del MVP

- Crear premios con `rewardType` (XLM, USDC, POINTS) y `distributionMode` (LOTTERY_SINGLE, SPLIT_EQUAL)
- Generar Payment Intents con `unsignedXdr` para XLM/USDC que el core firma y envía
- Verificar depósitos on-chain y registrar `lockRef` (tx hash)
- Ejecutar payouts automáticos en `drawAt` y registrar `payoutRef`
- Manejar POINTS completamente off-chain con ledger en Supabase
- Cobrar fee configurable vía `feeBps` (default 1000 = 10%)
- Diseñar arquitectura extensible para nuevos rewardTypes y distributionModes
- Proveer trazabilidad completa via proofs (on-chain hashes o ledger batch IDs)

---

## 3. No objetivos / Fuera de alcance

- Frontend o UI de ningún tipo
- Creación o gestión de formularios, preguntas o respuestas (lo hace core)
- Smart contracts / Soroban (fase 2)
- Gestión de trustlines USDC (se asume resuelto externamente)
- Multi-wallet por usuario
- Staking o yield sobre fondos lockeados
- Cancelación/refund de premios XLM/USDC (MVP)
- Soporte para más de 1 moneda nativa por prize
- Pago diferido ("pagar después")

---

## 4. Definiciones

| Término | Definición |
|---------|------------|
| **Prize** | Entidad que define el premio: tipo, monto, modo de distribución, fechas, estado |
| **Entry** | Participación de un usuario en un prize (vinculado a una respuesta de form) |
| **Vault** | Cuenta/cartera custodial que recibe fondos del creador y desde donde se distribuyen premios |
| **Payment Intent** | Intención de pago generada por el engine con `unsignedXdr` para que el core firme y envíe |
| **lockRef** | Hash de transacción on-chain que prueba el depósito de fondos en el vault |
| **payoutRef** | Hash de transacción on-chain (o batch) que prueba la distribución de premios |
| **ledgerBatchId** | ID de batch en tabla ledger de Supabase para movimientos off-chain (POINTS) |

---

## 5. Opciones soportadas

### rewardType

| Valor | Descripción | Blockchain |
|-------|-------------|------------|
| `XLM` | Stellar Lumens nativo | Sí |
| `USDC` | USDC en Stellar | Sí |
| `POINTS` | Puntos internos off-chain | No |

### distributionMode

| Valor | Descripción | Ganadores |
|-------|-------------|-----------|
| `LOTTERY_SINGLE` | Sorteo aleatorio | 1 |
| `SPLIT_EQUAL` | Reparto equitativo | Todos los entries válidos |

### feeBps

- Tipo: integer
- Default: 1000 (10%)
- Rango: 0 - 10000 (0% - 100%)
- Se aplica sobre `prizeAmount` bruto

### closeAt / drawAt

| Campo | Descripción | Obligatorio |
|-------|-------------|-------------|
| `closeAt` | Fecha/hora cierre de entries (ISO 8601) | Sí |
| `drawAt` | Fecha/hora ejecución de distribución (ISO 8601) | Sí |
| Restricción: `drawAt` >= `closeAt` |

---

## 6. Flujos principales

### Flujo A: USDC + LOTTERY_SINGLE

1. **Core crea prize** via `POST /api/prizes` con `{rewardType: "USDC", distributionMode: "LOTTERY_SINGLE", prizeAmount, closeAt, drawAt, feeBps}`
2. **Engine crea vault** dedicado para el prize y retorna `{prizeId, vaultAddress, status: "PENDING"}`
3. **Core solicita Payment Intent** via `POST /api/prizes/{prizeId}/payment-intent`
4. **Engine genera `unsignedXdr`** con operación payment USDC al vault y retorna `{paymentIntentId, unsignedXdr, expiresAt}`
5. **Core firma XDR** con wallet del creador y envía a Stellar
6. **Engine detecta depósito** via polling/job y actualiza `status: "LOCKED"`, guarda `lockRef` (tx hash)
7. **Usuarios participan** via entries (gestionados por core, validados por engine)
8. **En drawAt**, job `/jobs/tick` dispara distribución
9. **Engine selecciona 1 ganador** aleatoriamente de entries válidos
10. **Engine calcula**: `prizeNet = prizeAmount - (prizeAmount * feeBps / 10000)`
11. **Engine construye XDR payout** desde vault a ganador, firma con key vault, envía
12. **Engine actualiza** `status: "DISTRIBUTED"`, guarda `payoutRef` (tx hash)
13. **Core consulta** `GET /api/prizes/{prizeId}` para obtener proofs y mostrar al ganador

### Flujo B: XLM + SPLIT_EQUAL

1. **Core crea prize** via `POST /api/prizes` con `{rewardType: "XLM", distributionMode: "SPLIT_EQUAL", prizeAmount, closeAt, drawAt, feeBps}`
2. **Engine crea vault** dedicado y retorna `{prizeId, vaultAddress, status: "PENDING"}`
3. **Core solicita Payment Intent** via `POST /api/prizes/{prizeId}/payment-intent`
4. **Engine genera `unsignedXdr`** con operación payment XLM al vault y retorna `{paymentIntentId, unsignedXdr, expiresAt}`
5. **Core firma XDR** con wallet del creador y envía a Stellar
6. **Engine detecta depósito** via polling/job y actualiza `status: "LOCKED"`, guarda `lockRef`
7. **Usuarios participan** via entries
8. **En closeAt**, engine cierra entries (`status: "CLOSED"`)
9. **En drawAt**, job dispara distribución
10. **Engine obtiene N entries** válidos
11. **Engine calcula**: `prizeNet = prizeAmount - (prizeAmount * feeBps / 10000)`, `amountPerWinner = Math.floor(prizeNet / N)`, `remainder = prizeNet % N`
12. **Engine distribuye** `amountPerWinner` a cada entry, remainder al primer entry (por ID)
13. **Engine construye batch XDR** con N operaciones, firma, envía
14. **Engine actualiza** `status: "DISTRIBUTED"`, guarda `payoutRef`
15. **Core consulta** para mostrar distribución a cada participante

### Flujo C: POINTS + SPLIT_EQUAL

1. **Core crea prize** via `POST /api/prizes` con `{rewardType: "POINTS", distributionMode: "SPLIT_EQUAL", prizeAmount, closeAt, drawAt, feeBps}`
2. **Engine crea prize** sin vault, retorna `{prizeId, status: "PENDING"}`
3. **Core confirma locking** via `POST /api/prizes/{prizeId}/lock` (no hay blockchain)
4. **Engine actualiza** `status: "LOCKED"` inmediatamente, `lockRef = null`
5. **Usuarios participan** via entries
6. **En closeAt**, engine cierra entries (`status: "CLOSED"`)
7. **En drawAt**, job dispara distribución
8. **Engine obtiene N entries** válidos
9. **Engine calcula**: `prizeNet = prizeAmount - (prizeAmount * feeBps / 10000)`, `amountPerWinner = Math.floor(prizeNet / N)`, `remainder = prizeNet % N`
10. **Engine crea ledger batch** en Supabase con N movimientos de crédito
11. **Engine actualiza balances** de usuarios en tabla `user_balances`
12. **Engine actualiza** `status: "DISTRIBUTED"`, guarda `ledgerBatchId`
13. **Core consulta** para mostrar puntos acreditados a cada usuario

---

## 7. State machine

### Estados

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Prize creado, esperando depósito/lock |
| `LOCKED` | Fondos depositados y confirmados |
| `CLOSED` | Entries cerrados, esperando distribución |
| `DISTRIBUTED` | Premios distribuidos exitosamente |
| `FAILED` | Error durante distribución (retry posible) |
| `EXPIRED` | Payment intent expiró sin depósito (solo XLM/USDC) |

### Transiciones permitidas

**Para XLM/USDC:**
- `PENDING` → `LOCKED` (depósito confirmado)
- `PENDING` → `EXPIRED` (payment intent expiró)
- `LOCKED` → `CLOSED` (llegó closeAt)
- `CLOSED` → `DISTRIBUTED` (payout exitoso)
- `CLOSED` → `FAILED` (error en payout)
- `FAILED` → `DISTRIBUTED` (retry exitoso)

**Para POINTS:**
- `PENDING` → `LOCKED` (confirmación inmediata)
- `LOCKED` → `CLOSED` (llegó closeAt)
- `CLOSED` → `DISTRIBUTED` (distribución exitosa)
- `CLOSED` → `FAILED` (error en ledger)
- `FAILED` → `DISTRIBUTED` (retry exitoso)

### Invariantes

- Nunca se puede transicionar de `DISTRIBUTED` a otro estado
- Nunca se puede distribuir sin estar en `LOCKED` o `CLOSED`
- `payoutRef` solo existe en estado `DISTRIBUTED`
- `lockRef` solo existe en estado `LOCKED` o posterior (para XLM/USDC)
- No puede haber entries nuevos después de `CLOSED`
- `prizeAmount` es inmutable después de creación

---

## 8. Reglas de negocio

### Cálculo de fee

```
feeAmount = Math.floor(prizeAmount * feeBps / 10000)
prizeNet = prizeAmount - feeAmount
```

- Redondeo hacia abajo (floor) para feeAmount
- feeAmount >= 0 siempre
- Ejemplo: prizeAmount = 1000, feeBps = 1000 → fee = 100, prizeNet = 900

### Cierre de entries (closeAt)

- Job `/jobs/tick` verifica prizes con `closeAt <= now` y `status = LOCKED`
- Transición automática a `CLOSED`
- No se aceptan nuevos entries después de `CLOSED`
- Si no hay entries en `CLOSED`, distribución falla con error específico

### Momento de distribución (drawAt)

- Job `/jobs/tick` verifica prizes con `drawAt <= now` y `status = CLOSED`
- Ejecuta distribución según `distributionMode`
- Si `drawAt < closeAt`, error en creación (validación)

### Política de remainder en SPLIT_EQUAL

```
amountPerWinner = Math.floor(prizeNet / totalEntries)
remainder = prizeNet % totalEntries
```

- remainder se asigna al entry con menor ID (determinístico)
- Ejemplo: prizeNet = 100, 3 entries → 33, 33, 34 (el último recibe remainder)

### Idempotencia

- `distribute()` verifica `status` antes de ejecutar
- Si `status = DISTRIBUTED`, retorna sin acción
- `payoutRef` se escribe una sola vez con UPSERT
- Job `/jobs/tick` es seguro para ejecutar múltiples veces
- Tabla `distribution_attempts` registra cada intento con timestamp

### Cancel/refund

- **NO aplica en MVP** para XLM/USDC
- Una vez lockeado, fondos no pueden recuperarse hasta distribución
- POINTS pueden "cancelarse" antes de LOCKED (estado PENDING → CANCELLED manual)
- Refund/reclaim se implementa en fase 2

---

## 9. Auditoría / Proofs

### Campos obligatorios para XLM/USDC

```typescript
{
  prizeId: string
  status: PrizeStatus
  rewardType: "XLM" | "USDC"
  prizeAmount: number
  feeBps: number
  feeAmount: number
  prizeNet: number
  vaultAddress: string
  lockRef: string | null // tx hash
  payoutRef: string | null // tx hash
  lockedAt: ISO8601 | null
  distributedAt: ISO8601 | null
  entries: {
    entryId: string
    userId: string
    amount: number | null
    winner: boolean
  }[]
}
```

### Campos obligatorios para POINTS

```typescript
{
  prizeId: string
  status: PrizeStatus
  rewardType: "POINTS"
  prizeAmount: number
  feeBps: number
  feeAmount: number
  prizeNet: number
  lockRef: null
  payoutRef: null
  ledgerBatchId: string | null
  lockedAt: ISO8601 | null
  distributedAt: ISO8601 | null
  entries: {
    entryId: string
    userId: string
    amount: number | null
    winner: boolean
  }[]
}
```

### Respuesta al core para trazabilidad

- Endpoint: `GET /api/prizes/{prizeId}/proof`
- Retorna todos los campos de auditoría
- Incluye URLs a Stellar Explorer para XLM/USDC tx hashes
- Incluye link a ledger batch para POINTS
- Timestamps en ISO 8601 UTC
- Firmas digitales del engine (opcional, fase 2)

---

## 10. Decisiones técnicas recomendadas

### 1 vault por prize vs vault global

**Decisión: 1 vault por prize**

Justificación:
- Aislamiento de fondos: cada prize es trazable independientemente
- Simplifica auditoría y debugging
- Evita mezcla de fondos y errores de cálculo
- Permite rotación de keys sin afectar otros prizes
- Overhead mínimo: creación de cuenta en Stellar es barata (< 1 XLM)

### Fee: split en pago inicial vs post-depósito

**Decisión: Fee calculado en pago inicial, retenido en vault**

Justificación:
- Determinismo: fee conocido desde creación, no varía
- Simplicidad: un solo movimiento on-chain para payout
- El vault retiene `prizeAmount` completo, el fee se "quema" del balance del vault al distribuir
- Evita complicaciones de multiple-ops en payout

Alternativa considerada: fee en transacción separada post-payout (más complejo, más gas)

### Verificación: polling + job `/jobs/tick` vs streaming

**Decisión: Polling + job `/jobs/tick` (cron cada 30s)**

Justificación:
- MVP sin infraestructura compleja de streaming
- Stellar Horizon no garantiza streaming confiable para todos los casos
- Job idempotente es simple de debuggear
- Escala bien para volumen MVP (< 100 prizes activos)
- Fácil de migrar a streaming en fase 2

### Diseño extensible: adapters/strategies

**Interfaz conceptual:**

```typescript
interface RewardAdapter {
  type: RewardType
  createPaymentIntent(prize: Prize): Promise<PaymentIntent>
  verifyDeposit(prize: Prize): Promise<LockResult>
  distribute(prize: Prize, entries: Entry[]): Promise<DistributionResult>
  getProof(prize: Prize): Promise<Proof>
}

interface DistributionStrategy {
  mode: DistributionMode
  selectWinners(entries: Entry[], prizeNet: number): WinnerAllocation[]
}

// Registro de adapters
const rewardAdapters: Record<RewardType, RewardAdapter> = {
  XLM: new StellarAdapter("XLM"),
  USDC: new StellarAdapter("USDC"),
  POINTS: new PointsAdapter()
}

const distributionStrategies: Record<DistributionMode, DistributionStrategy> = {
  LOTTERY_SINGLE: new LotterySingleStrategy(),
  SPLIT_EQUAL: new SplitEqualStrategy()
}
```

Agregar nuevo rewardType: implementar `RewardAdapter` y registrar.
Agregar nuevo distributionMode: implementar `DistributionStrategy` y registrar.

---

## 11. Riesgos y mitigaciones

### Custodia de llaves

**Riesgo:** Compromiso de llave privada del vault → pérdida de fondos

**Mitigaciones:**
- Almacenar llaves en Supabase Vault (encrypted) o AWS KMS
- Rotación de llaves mensual (fase 2)
- Límite de monto máximo por vault (rate limiting)
- Monitoring de balances anómalos
- Multi-sig para vaults > 10,000 USDC (fase 2)

### Doble ejecución

**Riesgo:** Job `/jobs/tick` ejecuta distribución dos veces → doble pago

**Mitigaciones:**
- Row-level lock en tabla prizes durante distribución
- Flag `distributionInProgress` con timeout
- Verificación de `status` antes de cada paso
- Transacciones atómicas en Supabase
- Idempotency key en requests de distribución

### Payout parcial y retries

**Riesgo:** Payout falla a mitad de batch → algunos ganadores no reciben fondos

**Mitigaciones:**
- Transacciones atómicas en Stellar (batch completo o nada)
- Estado `FAILED` permite retry manual o automático
- Log detallado de cada operación en batch
- Reintento con exponential backoff (max 3 intentos)
- Si persiste, escalar a manual con fund recovery

### Depósito incorrecto

**Riesgo:** Usuario deposita monto diferente al declarado en prize

**Mitigaciones:**
- Validación estricta: monto depositado debe ser >= `prizeAmount`
- Si monto > prizeAmount, rechazar o aceptar con warning
- Si monto < prizeAmount, permanecer en PENDING, notificar core
- Memo obligatorio en transacción con `prizeId` para matching
- Timeout de payment intent (24h default) → EXPIRED si no deposita

---

## 12. Checklist de aceptación (Definition of Done)

- [ ] API `POST /api/prizes` crea prize con rewardType, distributionMode, prizeAmount, closeAt, drawAt
- [ ] API `POST /api/prizes/{id}/payment-intent` genera unsignedXdr para XLM/USDC
- [ ] API `POST /api/prizes/{id}/lock` confirma locking para POINTS
- [ ] Job `/jobs/tick` detecta depósitos y actualiza status a LOCKED
- [ ] Job `/jobs/tick` cierra entries en closeAt (status → CLOSED)
- [ ] Job `/jobs/tick` ejecuta distribución en drawAt según distributionMode
- [ ] LOTTERY_SINGLE selecciona exactamente 1 ganador aleatoriamente
- [ ] SPLIT_EQUAL distribuye equitativamente con política de remainder
- [ ] Fee se calcula correctamente con feeBps y se descuenta de prizeNet
- [ ] Estado DISTRIBUTED es final e inmutable
- [ ] API `GET /api/prizes/{id}/proof` retorna todos los campos de auditoría
- [ ] Tabla `prizes` en Supabase con todos los campos definidos
- [ ] Tabla `entries` vinculada a prizes y usuarios
- [ ] Tabla `ledger` para movimientos off-chain de POINTS
- [ ] Tabla `user_balances` para balances de POINTS
- [ ] Adapters implementados para XLM, USDC y POINTS
- [ ] Strategies implementadas para LOTTERY_SINGLE y SPLIT_EQUAL
- [ ] Tests unitarios para cálculo de fee y remainder
- [ ] Tests de integración para flujos A, B, C
- [ ] Documentación de API con OpenAPI/Swagger
- [ ] Variables de entorno documentadas (.env.example)
- [ ] Logging estructurado con niveles (info, warn, error)
- [ ] Monitoring de job `/jobs/tick` con alertas
- [ ] Seed data para desarrollo y testing
