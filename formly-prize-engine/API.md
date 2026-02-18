# API v1 — formly-prize-engine

Contrato REST para el microservicio backend-only. Consumido por el servicio core. Sin frontend.

---

## Overview

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Respuestas:** JSON. Fechas en ISO 8601 UTC. Montos como string decimal (ej: `"20.0000000"`).
- **rewardType:** `XLM` | `USDC` | `POINTS`
- **distributionMode:** `LOTTERY_SINGLE` | `SPLIT_EQUAL`
- **feeBps:** 0–10000; default 1000 (10%)
- XLM/USDC: pago/lock on-chain (Payment Intent → depósito detectado por engine → distribución en drawAt).
- POINTS: lock/payout off-chain (ledger en DB); lock explícito vía `POST /prizes/{prizeId}/lock`.
- Ejecución automática: endpoint interno `POST /api/v1/jobs/tick` (polling Horizon, cierre, distribución, retries).

---

## Auth

### Esquema

- **Header:** `Authorization: Bearer <token>`
- **Formato del token:** JWT o API key opaco. Validación: verificación de firma (JWT) o lookup en almacén (API key).
- **Errores de auth:**
  - Sin header → `401` con `errorCode: "UNAUTHORIZED"`.
  - Token inválido/expirado → `401` con `errorCode: "INVALID_TOKEN"`.
  - Token válido pero sin permiso para el recurso → `403` con `errorCode: "FORBIDDEN"`.

### Clasificación de endpoints

| Tipo | Descripción | Quién |
|------|-------------|--------|
| **Core** | Crear/consultar prizes, payment intents, entries, distribution, result | Servicio core (cliente principal) |
| **Internos** | Jobs (tick) | Scheduler/cron o servicio interno; no expuesto a core |

### Scopes/roles (conceptual)

- **core_service:** acceso a todos los endpoints excepto `/api/v1/jobs/*`.
- **internal_jobs:** acceso solo a `POST /api/v1/jobs/tick`.
- En MVP puede implementarse con dos API keys (o claims en JWT): una para core, otra para jobs.

---

## Conventions

### Base path

- Todas las rutas: `/api/v1/...`

### Headers requeridos (todas las peticiones)

| Header | Obligatorio | Descripción |
|--------|-------------|-------------|
| `Authorization` | Sí | `Bearer <token>` |
| `Content-Type` | Sí (body presente) | `application/json` |

### Headers recomendados

| Header | Uso |
|--------|-----|
| `Idempotency-Key` | UUID v4 para `POST /prizes`, `POST /prizes/{id}/payment-intent`, `POST /prizes/{id}/entries`, `POST /prizes/{id}/distribute`, `POST /prizes/{id}/lock`, `POST /prizes/{id}/close`, `POST /prizes/{id}/cancel`. El servidor devuelve la misma respuesta para la misma key en ventana (ej: 24h). |
| `X-Request-Id` | UUID opcional; si se envía, se refleja en `requestId` del error. |

### Paginación (list endpoints)

- Query: `limit` (default 20, max 100), `cursor` (opaque, de la respuesta anterior).
- Respuesta incluye: `items[]`, `nextCursor` (null si no hay más), `hasMore: boolean`.

### Versionado

- Versión en path: `/api/v1`. Cambios incompatibles implican nueva versión (v2). Campos nuevos en DTOs son compatibles hacia adelante; no se eliminan campos existentes sin deprecación.

---

## Error Model

Todas las respuestas de error usan este JSON:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Descripción legible para logs",
  "details": {},
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `errorCode` | string | Código fijo (ver tabla) |
| `message` | string | Mensaje humano/log |
| `details` | object | Datos adicionales (ej: `field`, `constraint`) |
| `requestId` | string | UUID de la petición (eco de `X-Request-Id` o generado) |

### Códigos de error

| errorCode | HTTP | Cuándo |
|-----------|------|--------|
| `UNAUTHORIZED` | 401 | Falta `Authorization` o header vacío |
| `INVALID_TOKEN` | 401 | Token mal formado, expirado o inválido |
| `FORBIDDEN` | 403 | Token válido pero sin permiso para el recurso/acción |
| `NOT_FOUND` | 404 | Recurso no existe (prize, entry, etc.) |
| `CONFLICT` | 409 | Estado no permite la acción (ej: prize ya LOCKED al crear payment-intent duplicado) |
| `VALIDATION_ERROR` | 400 | Fallo de validación de body/query (campos requeridos, enums, rangos) |
| `UNPROCESSABLE_ENTITY` | 422 | Regla de negocio (ej: drawAt < closeAt, prize no en estado correcto) |
| `PAYMENT_INTENT_EXPIRED` | 410 | Payment intent ya expirado |
| `DISTRIBUTION_FAILED` | 502 | Error durante distribución (transacción/ledger fallida) |
| `INTERNAL_ERROR` | 500 | Error no clasificado del servidor |

---

## Common DTOs

### Prize (modelo público)

```json
{
  "prizeId": "prize_01HXYZ...",
  "status": "PENDING",
  "rewardType": "USDC",
  "distributionMode": "LOTTERY_SINGLE",
  "prizeAmount": "100.0000000",
  "feeBps": 1000,
  "feeAmount": "10.0000000",
  "prizeNet": "90.0000000",
  "vaultAddress": "G...",
  "closeAt": "2025-03-01T12:00:00.000Z",
  "drawAt": "2025-03-02T12:00:00.000Z",
  "lockRef": null,
  "payoutRef": null,
  "ledgerBatchId": null,
  "lockedAt": null,
  "distributedAt": null,
  "createdAt": "2025-02-18T10:00:00.000Z",
  "updatedAt": "2025-02-18T10:00:00.000Z"
}
```

- `status`: `PENDING` | `LOCKED` | `CLOSED` | `DISTRIBUTED` | `FAILED` | `EXPIRED` | `CANCELLED`
- `vaultAddress`: solo XLM/USDC; null para POINTS.
- `lockRef`: hash de tx (XLM/USDC) o null (POINTS).
- `payoutRef`: hash de tx o batch (XLM/USDC) o null; POINTS usa `ledgerBatchId`.
- `ledgerBatchId`: solo POINTS; null para XLM/USDC.
- Montos: string decimal. `feeAmount`/`prizeNet` pueden venir en creación o tras lock.

### PrizeConfig (creación)

```json
{
  "rewardType": "USDC",
  "distributionMode": "LOTTERY_SINGLE",
  "prizeAmount": "100.0000000",
  "closeAt": "2025-03-01T12:00:00.000Z",
  "drawAt": "2025-03-02T12:00:00.000Z",
  "feeBps": 1000
}
```

- `feeBps` opcional; default 1000.
- `drawAt` >= `closeAt`; `prizeAmount` > 0.

### PaymentIntent

Respuesta de `POST /prizes/{prizeId}/payment-intent` (solo XLM/USDC):

```json
{
  "paymentIntentId": "pi_01HXYZ...",
  "unsignedXdr": "AAAA...",
  "networkPassphrase": "Public Global Stellar Network ; September 2015",
  "expiresAt": "2025-02-19T10:00:00.000Z",
  "memo": "prize_01HXYZ...",
  "expected": {
    "asset": "USDC",
    "amount": "100.0000000",
    "destination": "GVAULT..."
  }
}
```

- `expected.destination`: vault del prize.
- `expected.asset`: `XLM` o `USDC` (code + issuer si aplica).

### Entry

```json
{
  "entryId": "ent_01HXYZ...",
  "prizeId": "prize_01HXYZ...",
  "userId": "user_abc",
  "formResponseId": "resp_01HXYZ...",
  "amount": null,
  "winner": false,
  "createdAt": "2025-02-18T11:00:00.000Z"
}
```

- `amount`: null hasta distribución; luego monto asignado (string decimal).
- `winner`: true solo para LOTTERY_SINGLE cuando es el ganador.

### DistributionResult

Respuesta de `GET /prizes/{prizeId}/result`:

```json
{
  "prizeId": "prize_01HXYZ...",
  "status": "DISTRIBUTED",
  "payoutRef": "a1b2c3...",
  "ledgerBatchId": null,
  "distributedAt": "2025-03-02T12:00:05.000Z",
  "winners": [
    {
      "entryId": "ent_01HXYZ...",
      "userId": "user_abc",
      "amount": "90.0000000",
      "winner": true
    }
  ]
}
```

- Para POINTS, `payoutRef` null y `ledgerBatchId` presente.
- `winners`: en LOTTERY_SINGLE un elemento; en SPLIT_EQUAL todos los entries con monto.

### Proofs

- **On-chain (XLM/USDC):** `lockRef` y `payoutRef` son hashes de transacción Stellar. Opcional en respuesta: `lockExplorerUrl`, `payoutExplorerUrl` (URLs a Stellar Explorer).
- **Off-chain (POINTS):** `ledgerBatchId` identifica el batch en la tabla ledger. Opcional: `ledgerBatchUrl` o equivalente.

Proof completo: se obtiene con `GET /prizes/{prizeId}` (objeto Prize con todos los campos de auditoría).

### JobTickRequest

Body de `POST /jobs/tick`:

```json
{
  "runMode": "execute",
  "maxPrizes": 50,
  "nowOverride": "2025-03-02T12:00:00.000Z"
}
```

- `runMode`: `execute` | `dry_run`. Con `dry_run` no se persisten cambios.
- `maxPrizes`: límite de prizes a procesar en esta ejecución (default ej: 50).
- `nowOverride`: opcional; reemplaza "now" para tests (ISO 8601).

### JobTickResponse

```json
{
  "runMode": "execute",
  "processedAt": "2025-03-02T12:00:01.000Z",
  "phases": {
    "depositsChecked": 3,
    "depositsLocked": 1,
    "closed": 2,
    "distributed": 1,
    "failed": 0
  },
  "actions": [
    {
      "prizeId": "prize_01HXYZ...",
      "action": "LOCKED",
      "detail": "lockRef: a1b2c3..."
    },
    {
      "prizeId": "prize_01HXYZ...",
      "action": "CLOSED",
      "detail": null
    },
    {
      "prizeId": "prize_01HXYZ...",
      "action": "DISTRIBUTED",
      "detail": "payoutRef: d4e5f6..."
    }
  ]
}
```

- `phases`: conteos por fase (depósitos comprobados, lockeados, cerrados, distribuidos, fallidos).
- `actions`: lista resumida de acciones realizadas en esta ejecución.

---

## Endpoints

### Prize

#### POST /prizes

Crea un prize.

- **Auth:** core.
- **Idempotency-Key:** recomendado.
- **Body:** PrizeConfig.
- **Validaciones:** `rewardType` enum; `distributionMode` enum; `prizeAmount` string decimal > 0; `closeAt`, `drawAt` ISO 8601; `drawAt` >= `closeAt`; `feeBps` 0–10000.
- **Response:** `201` + Prize (con `status: "PENDING"`, `vaultAddress` para XLM/USDC, null para POINTS).

#### GET /prizes/{prizeId}

Lee un prize (modelo público + proofs).

- **Auth:** core.
- **Response:** `200` + Prize. `404` si no existe.

#### POST /prizes/{prizeId}/close

Cierra entries manualmente (admin). Transición LOCKED → CLOSED.

- **Auth:** core (admin) o interno.
- **Idempotency-Key:** recomendado.
- **Body:** `{}` o vacío.
- **Validaciones:** prize existe; status = LOCKED.
- **Response:** `200` + Prize actualizado. `409`/`422` si estado no permite.

#### POST /prizes/{prizeId}/cancel

Solo POINTS en PENDING. Transición PENDING → CANCELLED.

- **Auth:** core.
- **Idempotency-Key:** recomendado.
- **Body:** `{}` o vacío.
- **Validaciones:** prize existe; rewardType = POINTS; status = PENDING.
- **Response:** `200` + Prize. `422` si no es POINTS o no está PENDING.

#### POST /prizes/{prizeId}/lock

Solo POINTS. Marca el prize como lockeado (sin blockchain).

- **Auth:** core.
- **Idempotency-Key:** recomendado.
- **Body:** `{}` o vacío.
- **Validaciones:** prize existe; rewardType = POINTS; status = PENDING.
- **Response:** `200` + Prize (status LOCKED, lockRef null, lockedAt actualizado). `422` si no aplica.

---

### Payment Intent

#### POST /prizes/{prizeId}/payment-intent

Genera un Payment Intent (unsigned XDR) para XLM/USDC.

- **Auth:** core.
- **Idempotency-Key:** recomendado.
- **Body:** `{}` o vacío.
- **Validaciones:** prize existe; rewardType XLM o USDC; status = PENDING.
- **Response:** `201` + PaymentIntent (`unsignedXdr`, `networkPassphrase`, `expiresAt`, `memo`, `expected`). `422` si no es XLM/USDC o no está PENDING. `409` si ya existe un intent no expirado.

**Confirmación de pago (MVP):** el engine detecta el depósito solo (watcher vía job `/jobs/tick` que consulta Horizon). No hay endpoint de submit; el core solo firma y envía la XDR a Stellar; el engine actualiza a LOCKED cuando ve el pago al vault (memo = prizeId, monto >= prizeAmount).

*(Opcional si se añade submit más adelante: `POST /prizes/{prizeId}/submit-payment` con body `{"txHash": "..."}`; el engine validaría la tx en Horizon, comprobaría destino = vault, monto y memo, y actualizaría a LOCKED.)*

---

### Entries

#### POST /prizes/{prizeId}/entries

Añade una o más entries. Dedupe por (prizeId, userId) o (prizeId, formResponseId) según regla acordada (ej: un entry por userId por prize).

- **Auth:** core.
- **Idempotency-Key:** recomendado.
- **Body:**

```json
{
  "entries": [
    {
      "userId": "user_abc",
      "formResponseId": "resp_01HXYZ..."
    }
  ]
}
```

- **Validaciones:** prize existe; status en PENDING o LOCKED (no CLOSED ni posterior); `userId` y `formResponseId` presentes; dedupe: si ya existe entry para ese userId (o formResponseId), se ignora ese item sin error (o se devuelve 200 con lista de creadas/omitidas).
- **Response:** `201` + `{ "created": 1, "entries": [ Entry, ... ] }` (solo las creadas). Si ninguna nueva por dedupe: `200` + misma estructura con `created: 0`.

#### GET /prizes/{prizeId}/entries

Lista entries del prize (admin), paginado.

- **Auth:** core.
- **Query:** `limit`, `cursor`.
- **Validaciones:** prize existe.
- **Response:** `200` + `{ "items": [ Entry, ... ], "nextCursor": "...", "hasMore": false }`.

---

### Distribution

#### POST /prizes/{prizeId}/distribute

Dispara distribución manual (admin). Idempotente: si ya está DISTRIBUTED, retorna 200 sin cambiar nada.

- **Auth:** core (admin).
- **Idempotency-Key:** recomendado.
- **Body:** `{}` o vacío.
- **Validaciones:** prize existe; status = CLOSED; drawAt <= now (o se permite igual para manual).
- **Response:** `200` + DistributionResult. `422` si no está CLOSED o no hay entries válidos. `502` si falla la distribución (status FAILED).

#### GET /prizes/{prizeId}/result

Devuelve el resultado de la distribución.

- **Auth:** core.
- **Response:** `200` + DistributionResult. Si aún no distribuido: `404` o `200` con status distinto de DISTRIBUTED y campos de resultado vacíos (definir uno: se recomienda `200` + objeto con `status` y `winners: []` si no distribuido).

---

### Jobs

#### POST /jobs/tick

Ejecuta una pasada del job: verificar depósitos (Horizon), cerrar prizes en closeAt, distribuir en drawAt. Solo consumo interno.

- **Auth:** internal_jobs.
- **Body:** JobTickRequest.
- **Validaciones:** `runMode` enum; `maxPrizes` entero >= 1; `nowOverride` ISO 8601 si presente.
- **Response:** `200` + JobTickResponse.

---

## Validaciones por endpoint (resumen)

| Endpoint | Required | Enums | Reglas |
|----------|----------|--------|--------|
| POST /prizes | rewardType, distributionMode, prizeAmount, closeAt, drawAt | rewardType, distributionMode | prizeAmount > 0; feeBps 0–10000; drawAt >= closeAt |
| POST /prizes/{id}/payment-intent | — | — | rewardType XLM|USDC; status PENDING |
| POST /prizes/{id}/entries | entries[].userId, entries[].formResponseId | — | prize status PENDING|LOCKED; dedupe por userId (o formResponseId) por prize |
| POST /prizes/{id}/distribute | — | — | status CLOSED |
| POST /prizes/{id}/close | — | — | status LOCKED |
| POST /prizes/{id}/cancel | — | — | rewardType POINTS; status PENDING |
| POST /prizes/{id}/lock | — | — | rewardType POINTS; status PENDING |
| POST /jobs/tick | runMode | runMode | maxPrizes >= 1; nowOverride opcional |

---

## Examples

### Ejemplo 1: USDC + LOTTERY_SINGLE (payment-intent → locked por watcher → distribute → result)

**1. Crear prize**

```json
POST /api/v1/prizes
Content-Type: application/json
Authorization: Bearer <core_token>
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440001

{
  "rewardType": "USDC",
  "distributionMode": "LOTTERY_SINGLE",
  "prizeAmount": "100.0000000",
  "closeAt": "2025-03-01T12:00:00.000Z",
  "drawAt": "2025-03-02T12:00:00.000Z",
  "feeBps": 1000
}
```

Response `201`:

```json
{
  "prizeId": "prize_01HXYZ",
  "status": "PENDING",
  "rewardType": "USDC",
  "distributionMode": "LOTTERY_SINGLE",
  "prizeAmount": "100.0000000",
  "feeBps": 1000,
  "feeAmount": "10.0000000",
  "prizeNet": "90.0000000",
  "vaultAddress": "GVAULT123...",
  "closeAt": "2025-03-01T12:00:00.000Z",
  "drawAt": "2025-03-02T12:00:00.000Z",
  "lockRef": null,
  "payoutRef": null,
  "ledgerBatchId": null,
  "lockedAt": null,
  "distributedAt": null,
  "createdAt": "2025-02-18T10:00:00.000Z",
  "updatedAt": "2025-02-18T10:00:00.000Z"
}
```

**2. Solicitar Payment Intent**

```json
POST /api/v1/prizes/prize_01HXYZ/payment-intent
Content-Type: application/json
Authorization: Bearer <core_token>
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440002

{}
```

Response `201`:

```json
{
  "paymentIntentId": "pi_01HXYZ",
  "unsignedXdr": "AAAA...",
  "networkPassphrase": "Public Global Stellar Network ; September 2015",
  "expiresAt": "2025-02-19T10:00:00.000Z",
  "memo": "prize_01HXYZ",
  "expected": {
    "asset": "USDC",
    "amount": "100.0000000",
    "destination": "GVAULT123..."
  }
}
```

Core firma la XDR y envía a Stellar. No hay submit al engine.

**3. Polling de status (core hace GET hasta LOCKED)**

```json
GET /api/v1/prizes/prize_01HXYZ
Authorization: Bearer <core_token>
```

Cuando el job detecta el depósito, response `200` incluye:

```json
{
  "prizeId": "prize_01HXYZ",
  "status": "LOCKED",
  "lockRef": "a1b2c3d4e5f6...",
  "lockedAt": "2025-02-18T11:30:00.000Z",
  ...
}
```

**4. Añadir entries**

```json
POST /api/v1/prizes/prize_01HXYZ/entries
Content-Type: application/json
Authorization: Bearer <core_token>

{
  "entries": [
    { "userId": "user_1", "formResponseId": "resp_1" },
    { "userId": "user_2", "formResponseId": "resp_2" }
  ]
}
```

Response `201`: `{ "created": 2, "entries": [ ... ] }`

**5. Tras closeAt y drawAt, job ejecuta distribución. Consultar result**

```json
GET /api/v1/prizes/prize_01HXYZ/result
Authorization: Bearer <core_token>
```

Response `200`:

```json
{
  "prizeId": "prize_01HXYZ",
  "status": "DISTRIBUTED",
  "payoutRef": "f6e5d4c3b2a1...",
  "ledgerBatchId": null,
  "distributedAt": "2025-03-02T12:00:05.000Z",
  "winners": [
    {
      "entryId": "ent_01HXYZ",
      "userId": "user_1",
      "amount": "90.0000000",
      "winner": true
    }
  ]
}
```

---

### Ejemplo 2: POINTS + SPLIT_EQUAL (add entries → lock → close → distribute → result)

**1. Crear prize**

```json
POST /api/v1/prizes
Content-Type: application/json
Authorization: Bearer <core_token>

{
  "rewardType": "POINTS",
  "distributionMode": "SPLIT_EQUAL",
  "prizeAmount": "60.0000000",
  "closeAt": "2025-03-01T12:00:00.000Z",
  "drawAt": "2025-03-02T12:00:00.000Z",
  "feeBps": 1000
}
```

Response `201`: Prize con `vaultAddress: null`, `status: "PENDING"`.

**2. Lock (POINTS)**

```json
POST /api/v1/prizes/prize_02ABC/lock
Content-Type: application/json
Authorization: Bearer <core_token>

{}
```

Response `200`: Prize con `status: "LOCKED"`, `lockRef: null`, `lockedAt` actualizado.

**3. Añadir entries**

```json
POST /api/v1/prizes/prize_02ABC/entries
Content-Type: application/json
Authorization: Bearer <core_token>

{
  "entries": [
    { "userId": "u1", "formResponseId": "r1" },
    { "userId": "u2", "formResponseId": "r2" },
    { "userId": "u3", "formResponseId": "r3" }
  ]
}
```

Response `201`: `{ "created": 3, "entries": [ ... ] }`

**4. Cerrar (manual o por job en closeAt)**

```json
POST /api/v1/prizes/prize_02ABC/close
Content-Type: application/json
Authorization: Bearer <core_token>

{}
```

Response `200`: Prize con `status: "CLOSED"`.

**5. Distribuir (manual o por job en drawAt)**

```json
POST /api/v1/prizes/prize_02ABC/distribute
Content-Type: application/json
Authorization: Bearer <core_token>

{}
```

Response `200`:

```json
{
  "prizeId": "prize_02ABC",
  "status": "DISTRIBUTED",
  "payoutRef": null,
  "ledgerBatchId": "batch_01HXYZ",
  "distributedAt": "2025-03-02T12:00:05.000Z",
  "winners": [
    { "entryId": "ent_1", "userId": "u1", "amount": "18.0000000", "winner": false },
    { "entryId": "ent_2", "userId": "u2", "amount": "18.0000000", "winner": false },
    { "entryId": "ent_3", "userId": "u3", "amount": "18.0000000", "winner": false }
  ]
}
```

(prizeNet = 54; 54/3 = 18 cada uno; remainder 0.)

**6. Result (mismo que GET result tras distribución)**

```json
GET /api/v1/prizes/prize_02ABC/result
Authorization: Bearer <core_token>
```

Response `200`: mismo objeto DistributionResult anterior.
