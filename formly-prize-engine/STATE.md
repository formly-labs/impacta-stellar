# STATE — Máquina de estados y reglas de negocio (formly-prize-engine)

Especificación implementable de la state machine, invariantes, reglas de negocio, idempotencia y recuperación. Sin diagramas.

---

## 1) Enumeraciones oficiales

### PrizeStatus

Lista final de estados de un prize. Valor almacenado en DB y expuesto en API.

| Valor | Descripción | rewardType aplicable |
|-------|-------------|----------------------|
| `PENDING` | Creado; esperando depósito (XLM/USDC) o llamada a lock (POINTS) | Todos |
| `LOCKED` | Fondos confirmados (on-chain o lock explícito POINTS) | Todos |
| `CLOSED` | Entries cerrados; esperando distribución | Todos |
| `DISTRIBUTED` | Premios distribuidos; estado final | Todos |
| `FAILED` | Error en distribución; admite retry | Todos |
| `EXPIRED` | Payment intent expiró sin depósito | Solo XLM, USDC |
| `CANCELLED` | Prize cancelado antes de lock | Solo POINTS |

### RewardType

| Valor | Descripción |
|-------|-------------|
| `XLM` | Stellar Lumens nativo (on-chain) |
| `USDC` | USDC en Stellar (on-chain) |
| `POINTS` | Puntos off-chain (ledger en DB) |

### DistributionMode

| Valor | Descripción | Número de receptores |
|-------|-------------|----------------------|
| `LOTTERY_SINGLE` | Un ganador aleatorio | 1 |
| `SPLIT_EQUAL` | Reparto equitativo | Todos los entries válidos |

---

## 2) Transiciones permitidas

Cada transición se define como: estado origen → estado destino; condición exacta; actor que la dispara.

### XLM / USDC

| FROM | TO | Condición | Actor |
|------|-----|------------|--------|
| PENDING | LOCKED | Depósito on-chain verificado (memo = prizeId, destino = vault, monto >= prizeAmount) | Job (tick) |
| PENDING | EXPIRED | expiresAt del payment intent < now y no hay depósito | Job (tick) |
| LOCKED | CLOSED | closeAt <= now | Job (tick) o admin (POST /prizes/{id}/close) |
| CLOSED | DISTRIBUTED | Payout on-chain exitoso (tx confirmada) | Job (tick) o admin (POST /prizes/{id}/distribute) |
| CLOSED | FAILED | Intento de payout falló (red, fee, etc.) | Job (tick) o admin (POST /prizes/{id}/distribute) |
| FAILED | DISTRIBUTED | Retry de distribución exitoso | Job (tick) o admin (POST /prizes/{id}/distribute) |

No hay transición PENDING → CANCELLED para XLM/USDC en MVP.

### POINTS

| FROM | TO | Condición | Actor |
|------|-----|------------|--------|
| PENDING | LOCKED | Core llama POST /prizes/{id}/lock | Core (API) |
| PENDING | CANCELLED | Core llama POST /prizes/{id}/cancel | Core (API) |
| LOCKED | CLOSED | closeAt <= now | Job (tick) o admin (POST /prizes/{id}/close) |
| CLOSED | DISTRIBUTED | Ledger batch creado y balances actualizados correctamente | Job (tick) o admin (POST /prizes/{id}/distribute) |
| CLOSED | FAILED | Error al escribir ledger o balances | Job (tick) o admin (POST /prizes/{id}/distribute) |
| FAILED | DISTRIBUTED | Retry de distribución exitoso | Job (tick) o admin (POST /prizes/{id}/distribute) |

### Reglas transversales

- No existe transición desde DISTRIBUTED a ningún otro estado.
- No existe transición desde EXPIRED ni desde CANCELLED a ningún otro estado (estados finales).
- Cualquier otra combinación (FROM, TO) no listada está prohibida.

---

## 3) Invariantes

Las siguientes reglas deben cumplirse siempre (validar en código y en DB cuando aplique).

| # | Invariante |
|---|------------|
| I1 | Si status = DISTRIBUTED, no se permite ninguna transición de estado. |
| I2 | Distribución (payout o ledger) solo se ejecuta si status = CLOSED. |
| I3 | payoutRef (XLM/USDC) o ledgerBatchId (POINTS) solo están definidos cuando status = DISTRIBUTED. |
| I4 | lockRef (XLM/USDC) solo está definido cuando status ∈ { LOCKED, CLOSED, FAILED, DISTRIBUTED }. Para POINTS, lockRef es siempre null. |
| I5 | vaultAddress es no null solo si rewardType ∈ { XLM, USDC }; es null para POINTS. |
| I6 | No se aceptan nuevas entries (POST /entries) cuando status ∈ { CLOSED, DISTRIBUTED, FAILED, EXPIRED, CANCELLED }. Solo PENDING y LOCKED aceptan entries. |
| I7 | prizeAmount, rewardType, distributionMode, closeAt, drawAt son inmutables tras la creación del prize. |
| I8 | drawAt >= closeAt en todo prize (validación en creación). |
| I9 | status = EXPIRED o CANCELLED solo si rewardType y estado coinciden con la tabla de transiciones (EXPIRED solo XLM/USDC; CANCELLED solo POINTS). |
| I10 | lockedAt no null implica status ∈ { LOCKED, CLOSED, FAILED, DISTRIBUTED }. distributedAt no null implica status = DISTRIBUTED. |

---

## 4) Reglas de negocio (exactas)

### feeBps

- Rango permitido: 0 <= feeBps <= 10000 (0% a 100%).
- Default si se omite: 1000 (10%).
- Tipo: entero. Validación en creación y (si se permitiera actualización) en actualización.

### Cálculo de fee y precisión por asset

- Fórmula: `feeAmount = floor(prizeAmount * feeBps / 10000)`; `prizeNet = prizeAmount - feeAmount`.
- feeAmount y prizeNet se almacenan con la misma precisión que prizeAmount (ver abajo).
- Redondeo: siempre floor para feeAmount; prizeNet es exacto (resta de dos valores ya representados).
- Precisión por rewardType:
  - **XLM:** 7 decimales. prizeAmount, feeAmount, prizeNet como string "X.XXXXXXX".
  - **USDC:** 7 decimales. Mismo formato.
  - **POINTS:** 7 decimales. Mismo formato.
- En cálculos internos usar tipos de precisión fija (ej: enteros en stroops/smallest unit) o decimal library; evitar float para dinero.

### prizeNet y remainder en SPLIT_EQUAL

- `prizeNet` = prizeAmount - feeAmount (ya definido arriba).
- Entries válidos: todos los entries del prize con status CLOSED (sin filtro adicional en MVP; si hubiera campo "invalid" no se cuentan).
- N = número de entries válidos en el momento de distribución.
- Si N = 0: no se ejecuta distribución; ver regla "Sin entries al distribuir".
- Cálculo:
  - `amountPerWinner = floor(prizeNet / N)`
  - `remainder = prizeNet - (amountPerWinner * N)` (equivalente a prizeNet % N en enteros).
- Asignación del remainder (determinística):
  - Ordenar entries por `entryId` ASC.
  - El primer entry de la lista (menor entryId) recibe `amountPerWinner + remainder`.
  - El resto recibe `amountPerWinner` cada uno.
- Ejemplo: prizeNet = 100, N = 3 → amountPerWinner = 33, remainder = 1. Entries [ent_A, ent_B, ent_C] → A: 34, B: 33, C: 33.

### LOTTERY_SINGLE

- Se elige exactamente 1 ganador entre los N entries válidos.
- Método: aleatorio uniforme (seed opcional por prizeId + drawAt para reproducibilidad en tests). En producción: crypto-grade RNG.
- El ganador recibe prizeNet; los demás amount = 0 (o no aparecen en winners según contrato API).

### Sin entries al distribuir (N = 0)

- No se ejecuta transferencia on-chain ni escritura en ledger.
- Comportamiento obligatorio: transición a FAILED (o mantener CLOSED según política; se define abajo).
- Política adoptada: **status permanece CLOSED**; el job o el admin reciben error explícito (ej: `NO_ENTRIES_TO_DISTRIBUTE`). No se transiciona a DISTRIBUTED ni se escribe payoutRef/ledgerBatchId. Opción alternativa: transicionar a FAILED con detail "no entries". Para implementación unívoca: **transicionar a FAILED** con código de error / detail que indique "no hay entries válidos para distribuir". Así el prize queda en estado retryable pero sin payout (retry seguirá fallando hasta que no sea el caso; o se documenta que con 0 entries no hay retry que lo arregle).

Resumen: **Si N = 0 → status → FAILED, no se escribe payoutRef/ledgerBatchId; detail indica "no entries".**

### Mínimo de entries

- MVP: no hay mínimo de entries para crear prize ni para cerrar.
- Al distribuir: si N = 0, aplicar regla anterior (FAILED). Si N >= 1, distribuir según distributionMode (LOTTERY_SINGLE: 1 ganador; SPLIT_EQUAL: todos).

---

## 5) Idempotencia y locks

### Operaciones que deben ser idempotentes

| Operación | Endpoint / contexto | Idempotencia |
|-----------|----------------------|--------------|
| Create prize | POST /prizes | Por Idempotency-Key: misma key → mismo prizeId y 201 la primera vez; 200 + mismo body en reintentos dentro de ventana. |
| Payment intent | POST /prizes/{id}/payment-intent | Por Idempotency-Key: misma key → mismo paymentIntentId y misma unsignedXdr; no crear segundo intent si ya existe uno no expirado. |
| Add entry | POST /prizes/{id}/entries | Por Idempotency-Key + dedupe por (prizeId, userId). Misma key y mismos entries → misma respuesta (created puede ser 0 si todos duplicados). |
| Close | POST /prizes/{id}/close | Por Idempotency-Key: misma key → 200 y status CLOSED; si ya CLOSED, 200 sin cambio. |
| Distribute | POST /prizes/{id}/distribute (o desde job) | Si status ya es DISTRIBUTED → retornar 200 + mismo DistributionResult sin ejecutar. Si FAILED/CLOSED → ejecutar (o retry). |
| Lock (POINTS) | POST /prizes/{id}/lock | Por Idempotency-Key: misma key → 200 y status LOCKED; si ya LOCKED, 200 sin cambio. |
| Cancel (POINTS) | POST /prizes/{id}/cancel | Por Idempotency-Key: misma key → 200; si ya CANCELLED, 200 sin cambio. |
| Payout (batch on-chain o ledger) | Interno (dentro de distribute) | Una sola escritura de payoutRef o ledgerBatchId por prize; usar transacción DB + condición "WHERE status = CLOSED" y luego SET status = DISTRIBUTED. |

### Cómo se logra

- **Idempotency-Key (header):**
  - Donde aplica: POST /prizes, POST /prizes/{id}/payment-intent, POST /prizes/{id}/entries, POST /prizes/{id}/close, POST /prizes/{id}/distribute, POST /prizes/{id}/lock, POST /prizes/{id}/cancel.
  - Almacenamiento: tabla `idempotency_keys` con columnas (key_hash, scope, resource_id, response_status, response_body_hash, created_at). scope = "prize_create" | "payment_intent" | "entries" | "close" | "distribute" | "lock" | "cancel"; resource_id = prizeId (o prizeId+paymentIntentId si se quiere granularidad). Ventana: 24 h; tras 24 h se puede reutilizar la key (o rechazar; documentar).
  - Comportamiento: si existe registro con misma key_hash y scope/resource coherente y dentro de ventana → devolver respuesta almacenada (status y body) sin re-ejecutar lógica.

- **Locks transaccionales en DB:**
  - Al ejecutar **distribute**: adquirir advisory lock por prizeId (ej: `pg_advisory_xact_lock(hashed(prizeId))`) o SELECT ... FOR UPDATE del row del prize al inicio de la transacción. Así dos ticks o dos llamadas concurrentes a distribute no ejecutan payout dos veces.
  - Al **confirmar depósito** (tick): SELECT prize FOR UPDATE donde status = PENDING y rewardType in (XLM, USDC), luego UPDATE a LOCKED; evita doble aplicación del mismo depósito.
  - Al **cerrar** (tick o admin): SELECT FOR UPDATE del prize, comprobar status = LOCKED, luego UPDATE a CLOSED.

- **Dedupe de entries:** en POST /entries, por (prizeId, userId): si ya existe entry con ese userId para el prize, no insertar de nuevo; incluir en respuesta "created" solo las nuevas. No devolver error por duplicado.

### Comportamiento en retry

- **Distribute ya ejecutado (status = DISTRIBUTED):** retornar 200 y el DistributionResult existente; no volver a enviar tx ni escribir ledger.
- **Payout parcial (solo aplicable si en el futuro hubiera batches no atómicos):** en MVP, Stellar y ledger son atómicos (una tx o un batch en una transacción). Si en el futuro hubiera batches parciales: persistir qué entries ya recibieron; en retry solo enviar a los faltantes; al completar todos, status = DISTRIBUTED. En MVP no requerido.
- **Payment intent:** retry con misma Idempotency-Key devuelve el mismo intent; no generar nueva XDR.

---

## 6) Time-based automation (jobs/tick)

### Qué hace el job

1. Confirmar depósitos (PENDING → LOCKED para XLM/USDC).
2. Cerrar prizes (LOCKED → CLOSED cuando closeAt <= now).
3. Ejecutar distribución (CLOSED → DISTRIBUTED o FAILED cuando drawAt <= now).
4. Marcar payment intents expirados (PENDING → EXPIRED cuando expiresAt < now, XLM/USDC).

### Criterios de decisión

| Acción | Condición en DB (además de rewardType cuando aplique) |
|--------|------------------------------------------------------|
| Confirmar depósito | status = PENDING, rewardType IN (XLM, USDC), existe payment intent no expirado; consultar Horizon por pagos al vault con memo = prizeId y monto >= prizeAmount; si existe tx confirmada → transición a LOCKED, guardar lockRef = tx hash, lockedAt = now. |
| Pasar a EXPIRED | status = PENDING, rewardType IN (XLM, USDC), expiresAt del payment intent < now. |
| Pasar a CLOSED | status = LOCKED, closeAt <= now. |
| Ejecutar distribución | status = CLOSED, drawAt <= now. |

### Orden de operaciones dentro de un tick (prioridades)

Ejecutar en este orden dentro de una misma invocación de tick, para cada prize procesado (hasta maxPrizes):

1. **Fase 1 — Depósitos:** Para cada prize con status = PENDING y rewardType XLM/USDC: si expiresAt < now → EXPIRED; si no, consultar Horizon y si hay depósito válido → LOCKED.
2. **Fase 2 — Cierre:** Para cada prize con status = LOCKED y closeAt <= now → CLOSED.
3. **Fase 3 — Distribución:** Para cada prize con status = CLOSED y drawAt <= now → ejecutar lógica de distribución (selección ganadores / split, construcción tx o ledger); si éxito → DISTRIBUTED; si error → FAILED.

Cada prize se procesa como máximo una vez por fase en un mismo tick (no aplicar dos veces la misma transición en la misma ejecución). Procesar por orden determinista (ej: prizeId ASC) para evitar sesgos.

### Límites

- maxPrizes: límite de prizes a considerar en total (ej: 50). Aplicar a la unión de candidatos de las tres fases; si se llena el cupo, dejar el resto para el siguiente tick.

---

## 7) Casos de error y recuperación

### Depósito incorrecto (asset / monto / memo)

- **Memo distinto de prizeId:** No considerar el pago como válido para ese prize; no transicionar a LOCKED. El prize sigue en PENDING hasta expiresAt (luego EXPIRED).
- **Monto < prizeAmount:** No transicionar a LOCKED. Opcional: registrar intento en log para soporte. Prize sigue PENDING → eventualmente EXPIRED.
- **Monto >= prizeAmount:** Aceptar; transicionar a LOCKED. No aceptar "sobrante" como crédito extra en MVP; el vault recibe el monto y queda así.
- **Asset incorrecto (ej: XLM en prize USDC):** No considerar el pago; no transicionar. Prize sigue PENDING → EXPIRED.
- **Destino no es el vault del prize:** Ignorar; no transicionar.

### Payout fallido (red, fee insuficiente, etc.)

- Dejar status en CLOSED (o transicionar a FAILED según implementación). Se recomienda: **transicionar a FAILED** y guardar en tabla distribution_attempts (prizeId, attempted_at, error_message, error_code).
- No escribir payoutRef ni ledgerBatchId.
- Retry: manual (POST /distribute) o siguiente tick. Mismo flujo: si status = FAILED y drawAt <= now, se puede reintentar (o permitir retry solo para FAILED). Recomendación: permitir retry tanto para CLOSED como FAILED cuando drawAt <= now.

### Payout parcial

- En MVP, Stellar: una transacción con N operaciones es atómica; o todo éxito o todo fallo. No hay "mitad enviada".
- Ledger POINTS: escribir en una transacción DB (batch + actualización de balances + status DISTRIBUTED). Si falla, todo rollback; status queda CLOSED o FAILED.
- Si en el futuro hubiera batches no atómicos: persistir por entry "payout_sent"; en retry solo pagar a los que no tienen payout_sent; al completar todos, status = DISTRIBUTED.

### Doble tick simultáneo (concurrencia)

- Usar advisory lock (o FOR UPDATE) por prize al:
  - Confirmar depósito (PENDING → LOCKED).
  - Cerrar (LOCKED → CLOSED).
  - Distribuir (CLOSED → DISTRIBUTED/FAILED).
- El segundo proceso espera o falla al no obtener lock; al leer de nuevo, ve status ya actualizado y no reaplica (idempotencia).

### Estados resultantes y reintento

| Estado final | Significado | Acción de reintento |
|--------------|-------------|---------------------|
| EXPIRED | No se recibió depósito a tiempo | Sin reintento; prize final. |
| CANCELLED | POINTS cancelado por core | Sin reintento. |
| FAILED | Error en distribución (red, 0 entries, etc.) | Retry manual o en siguiente tick (POST /distribute o job). Reintentar solo si drawAt <= now y N >= 1 (si falló por 0 entries, no hay retry que lo arregle). |
| DISTRIBUTED | Éxito | Ninguna acción; estado final. |

### Resumen de recuperación

- **Depósito nunca llegó:** Prize queda EXPIRED; no hay recuperación en MVP.
- **Depósito incorrecto:** Prize queda PENDING → EXPIRED; no hay recuperación en MVP.
- **Distribución fallida (red/error):** Status FAILED; retry igual que distribución normal (mismo endpoint/job).
- **Distribución fallida (0 entries):** Status FAILED; no tiene sentido retry de distribución; opcional: endpoint admin para marcar como "closed without payout" o dejar en FAILED.
