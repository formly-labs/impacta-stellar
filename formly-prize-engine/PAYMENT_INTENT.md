# PAYMENT INTENT — Spec y generación XDR (XLM/USDC)

Especificación del Payment Intent y construcción de la transacción Stellar (unsigned XDR) para formly-prize-engine. Solo aplica a rewardType XLM y USDC.

---

## 1) Objetivo del Payment Intent

Permitir que el creador del premio pague desde su wallet Stellar al vault del prize (y al vault de fees) sin que el engine tenga acceso a la clave del creador. El engine genera una transacción **sin firmar** (unsigned XDR) con las operaciones y montos correctos; el core la presenta al usuario para firma y envío a la red. Tras el envío, el engine verifica el depósito on-chain y marca el prize como LOCKED (lockRef). El intent incluye expiración, memo determinístico y un payload "expected" para que el core pueda validar que la XDR firmada coincide con lo acordado.

---

## 2) Tipos y enums

### AssetType (solo on-chain en este spec)

| Valor | Descripción | Tipo Stellar |
|-------|-------------|--------------|
| `XLM` | Lumens nativos | AssetType.assetTypeNative() |
| `USDC` | USDC en Stellar | AssetType.assetTypeCreditAlphanum4 + code "USDC" + issuer |

### Network

| Valor | networkPassphrase | Uso |
|-------|-------------------|-----|
| `testnet` | "Test SDF Network ; September 2015" | Pruebas |
| `mainnet` | "Public Global Stellar Network ; September 2015" | Producción |

En el DTO se expone `networkPassphrase` (string); el enum Network es interno o para config.

---

## 3) Precisión y representación de montos

### En la API

- Todos los montos se representan como **string decimal** con exactamente **7 decimales**.
- Formato: `"<entero>.<7 dígitos>"`, ej: `"100.0000000"`, `"0.5000000"`.
- No usar notación científica ni más de 7 decimales.

### Reglas de redondeo (fee y prizeNet)

- `feeAmount = floor(prizeAmount * feeBps / 10000)` (en unidades de 10^-7, luego formatear a string).
- `prizeNet = prizeAmount - feeAmount` (exacto; luego formatear a string).
- En implementación: usar enteros en stroops/smallest-unit para evitar float; convertir a string con 7 decimales al serializar.

### Decimales en Stellar

- **XLM:** 1 XLM = 10^7 stroops. Cantidad en XDR = entero stroops.
- **USDC (y créditos Stellar):** 1 unidad = 10^7 (7 decimales). Cantidad en XDR = entero en "smallest unit".
- Conversión string → XDR: parsear string, multiplicar por 10^7, truncar a entero (no redondear hacia arriba para no exceder el monto declarado).

Ejemplo en código (conceptual):

```ts
const DECIMALS = 7;
function amountToStroops(amountStr: string): bigint {
  const [whole, frac = ''] = parts(amountStr);
  const padded = frac.padEnd(DECIMALS, '0').slice(0, DECIMALS);
  return BigInt(whole + padded);
}
```

---

## 4) Payload exacto del Payment Intent (DTO)

Respuesta del endpoint `POST /api/v1/prizes/{prizeId}/payment-intent`. El cuerpo del request puede incluir `creatorPublicKey` (requerido para generar la XDR).

### Campos obligatorios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `paymentIntentId` | string | ID único del intent (ej: pi_01HXYZ). |
| `prizeId` | string | external_id del prize (ej: prize_01HXYZ). |
| `rewardType` | "XLM" \| "USDC" | Asset del premio. |
| `amountTotal` | string | Monto total que paga el creador; 7 decimales. Coincide con prizeAmount. |
| `feeBps` | number | Basis points del fee (ej: 1000). |
| `feeAmount` | string | Monto del fee; 7 decimales. |
| `prizeNet` | string | Monto que recibe el vault del prize; 7 decimales. |
| `memo` | string | Texto que debe ir en la transacción (máx 28 bytes). Formato: ver sección 5. |
| `depositTarget` | string | Public key del vault del prize (G...). |
| `feeTarget` | string | Public key del vault de fees (G...). |
| `unsignedXdr` | string | Transacción Stellar en base64 (TransactionEnvelope o Transaction), sin firmar. |
| `networkPassphrase` | string | Passphrase de la red Stellar. |
| `expiresAt` | string | ISO 8601 UTC; después de este momento el intent no debe usarse. |
| `expectedPayments` | array | Lista exacta de pagos que la transacción debe contener (ver abajo). |
| `hash` | string | Hash del intent para auditoría/validación (ej: SHA256 de payload canónico). |

Estructura de cada elemento de `expectedPayments`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `asset` | "XLM" \| "USDC" | Tipo de asset. |
| `amount` | string | Monto con 7 decimales. |
| `destination` | string | Public key (G...) del destinatario. |
| `issuer` | string | Solo si asset = "USDC"; issuer del USDC. |

Orden recomendado: primero pago a depositTarget (prizeNet), luego pago a feeTarget (feeAmount).

### Campos opcionales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `horizonUrl` | string | URL del Horizon para que el core pueda consultar/submit. |
| `minTime` | string | ISO 8601; timeBounds.minTime si se usan. |
| `maxTime` | string | ISO 8601; timeBounds.maxTime (debe ser <= expiresAt). |

### Ejemplo de expectedPayments (USDC)

```json
[
  {
    "asset": "USDC",
    "amount": "90.0000000",
    "destination": "GVAULT1234567890ABCDEF",
    "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  },
  {
    "asset": "USDC",
    "amount": "10.0000000",
    "destination": "GFEEVAULT1234567890AB",
    "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  }
]
```

### Ejemplo de expectedPayments (XLM)

```json
[
  {
    "asset": "XLM",
    "amount": "90.0000000",
    "destination": "GVAULT1234567890ABCDEF"
  },
  {
    "asset": "XLM",
    "amount": "10.0000000",
    "destination": "GFEEVAULT1234567890AB"
  }
]
```

(XLM no lleva `issuer`.)

---

## 5) Reglas de construcción del XDR

### Fuente de datos

- **Source account:** Public key del creador. El engine la recibe en el body del request: `{ "creatorPublicKey": "G..." }`. Obligatoria para generar la XDR.
- **Sequence:** Obtener la secuencia actual de la cuenta source desde Horizon: `GET /accounts/{creatorPublicKey}` → `sequence`. Usar ese número para la transacción (no incrementar; Stellar lo hace al aplicar la tx).
- **Deposit target / Fee target:** Del prize (vault_public_key) y de config (fee_vault_public_key). Ambos obligatorios para XLM/USDC en este diseño.

### Operaciones (orden)

1. **Payment 1:** Origen = creator (source account), destino = `depositTarget`, asset = según rewardType (XLM nativo o USDC con code+issuer), monto = `prizeNet` (en stroops/smallest unit).
2. **Payment 2:** Origen = creator, destino = `feeTarget`, mismo asset, monto = `feeAmount` (en stroops/smallest unit).

Solo hay una source account (el creador); ambas operaciones son Payment desde esa cuenta.

### Memo

- Tipo: MEMO_TEXT.
- Contenido: `PRIZE:<prizeId>` donde `prizeId` es el external_id del prize (ej: `prize_01HXYZ`).
- Límite Stellar: 28 bytes. Si `PRIZE:<prizeId>` supera 28 bytes, truncar el prizeId a 28 - 6 = 22 caracteres (por "PRIZE:").
- Debe ser determinístico: mismo prize → mismo memo siempre.

### Base fee

- Obtener de Horizon: `GET /fee_stats` → usar `max_fee` o `accepted_fee_per_operation` (en stroops). MVP: valor fijo aceptable, ej: 100 stroops por operación (0.00001 XLM). Para la transacción: fee = base_fee * num_operations (2) = 200 stroops si base 100.
- Poner ese fee en `Transaction.fee` (total para la tx, no por op).

### Timeout (timeBounds)

- `maxTime`: timestamp Unix correspondiente a `expiresAt` (segundos). El engine calcula `expiresAt = now + PAYMENT_INTENT_EXPIRY_HOURS` (ej: 24h) al crear el intent.
- `minTime`: opcional; puede ser `now - 300` (5 min de tolerancia) o 0.
- La transacción no será válida después de `maxTime`.

### Sequence

- Obtener de Horizon: `GET /accounts/{creatorPublicKey}` → campo `sequence`. Usar ese valor como `sequenceNumber` en la transacción. Si la cuenta no existe o no se puede obtener, fallar con error claro (no generar intent).

### Resumen de pasos (engine)

1. Validar request (prize existe, rewardType XLM/USDC, status PENDING, creatorPublicKey presente y formato G...).
2. Cargar prize: amountTotal, feeBps, feeAmount, prizeNet, depositTarget (vault_public_key), feeTarget (config).
3. Obtener sequence de creatorPublicKey vía Horizon.
4. Obtener base fee (Horizon fee_stats o fijo).
5. Construir Transaction: sourceAccount = creatorPublicKey, fee = baseFee * 2, sequence, timeBounds (minTime, maxTime = expiresAt), memo = MEMO_TEXT("PRIZE:<prizeId>" truncado a 28 bytes), ops = [ Payment(prizeNet → depositTarget), Payment(feeAmount → feeTarget) ] con asset correcto (XLM o USDC).
6. Envolver en TransactionEnvelope (envelopeType = ENVELOPE_TYPE_TX), sin firmas (signatures = []).
7. Codificar a base64 XDR → unsignedXdr.
8. Calcular hash del payload canónico (ej: JSON ordenado de prizeId, amountTotal, feeAmount, prizeNet, depositTarget, feeTarget, expiresAt, expectedPayments) → campo hash.
9. Persistir intent en DB (opcional); devolver DTO completo.

---

## 6) Validaciones antes de emitir intent

| Validación | Error si falla |
|------------|----------------|
| prize existe | NOT_FOUND |
| prize.rewardType ∈ { XLM, USDC } | UNPROCESSABLE_ENTITY (solo XLM/USDC) |
| prize.status = PENDING | UNPROCESSABLE_ENTITY (estado no permite intent) |
| prize.amount_total > 0 | Ya garantizado por creación; si no, UNPROCESSABLE_ENTITY |
| feeBps en [0, 10000] | Ya garantizado por creación |
| depositTarget (vault_public_key) no null | UNPROCESSABLE_ENTITY (vault no configurado) |
| feeTarget (fee vault) configurado en env/config | UNPROCESSABLE_ENTITY (fee vault no configurado) |
| creatorPublicKey presente en body | VALIDATION_ERROR |
| creatorPublicKey formato Stellar (G..., 56 chars base32) | VALIDATION_ERROR |
| drawAt >= closeAt | Ya garantizado por creación |
| No existe ya un payment intent activo (no expirado) para este prize | CONFLICT (o devolver el mismo si idempotency key) |

Para USDC: tener configurado issuer por red (testnet/mainnet); validar que el prize tenga o use el issuer por defecto.

---

## 7) Validación post-firma (recomendado)

### En el core (antes de enviar a la red)

- Decodificar la XDR firmada (TransactionEnvelope), extraer Transaction.
- Comprobar que el número de operaciones es 2 y que son Payment.
- Para cada operación, comprobar destino y monto contra `expectedPayments` (orden: primer pago = prizeNet a depositTarget, segundo = feeAmount a feeTarget).
- Comprobar que timeBounds.maxTime no está en el pasado.
- Opcional: recalcular hash del intent (mismos campos que el engine) y comparar con `hash`; si no coincide, no enviar.

### Qué guarda el engine para verificar el depósito luego

- `prizeId` (external_id).
- `depositTarget` (vault public key).
- `memo` esperado: "PRIZE:<prizeId>" (truncado 28 bytes).
- `amountTotal` mínimo a considerar válido: el vault debe recibir al menos `prizeNet` (en este diseño el vault recibe solo prizeNet; el fee va a feeTarget). Para detectar el pago: buscar en Horizon transacciones donde:
  - destination = depositTarget (vault del prize),
  - memo (text) = valor esperado,
  - amount >= prizeNet (en stroops),
  - asset = XLM o USDC según rewardType.
- Guardar en DB (prize o payment_intent): depositTarget, expected_memo, expected_min_amount (prizeNet), expected_asset, network_passphrase, expires_at. El job de tick usa esto para buscar la transacción en Horizon y, al encontrarla, actualizar prize a LOCKED y guardar lockRef = tx hash.

---

## 8) Ejemplos completos

### Example A: USDC intent (JSON)

`unsignedXdr` es un placeholder; en producción es la salida base64 de la TransactionEnvelope.

```json
{
  "paymentIntentId": "pi_01J0ABC123",
  "prizeId": "prize_01HXYZ",
  "rewardType": "USDC",
  "amountTotal": "100.0000000",
  "feeBps": 1000,
  "feeAmount": "10.0000000",
  "prizeNet": "90.0000000",
  "memo": "PRIZE:prize_01HXYZ",
  "depositTarget": "GVAULT1234567890ABCDEFGHIJ",
  "feeTarget": "GFEEVAULT1234567890ABCDEF",
  "unsignedXdr": "AAAAAgAAAAC...",
  "networkPassphrase": "Public Global Stellar Network ; September 2015",
  "expiresAt": "2025-02-19T10:00:00.000Z",
  "expectedPayments": [
    {
      "asset": "USDC",
      "amount": "90.0000000",
      "destination": "GVAULT1234567890ABCDEFGHIJ",
      "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    },
    {
      "asset": "USDC",
      "amount": "10.0000000",
      "destination": "GFEEVAULT1234567890ABCDEF",
      "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    }
  ],
  "hash": "a1b2c3d4e5f6...",
  "horizonUrl": "https://horizon.stellar.org",
  "minTime": "2025-02-18T09:55:00.000Z",
  "maxTime": "2025-02-19T10:00:00.000Z"
}
```

### Example B: XLM intent (JSON)

```json
{
  "paymentIntentId": "pi_01J0DEF456",
  "prizeId": "prize_01HXYZ",
  "rewardType": "XLM",
  "amountTotal": "500.0000000",
  "feeBps": 1000,
  "feeAmount": "50.0000000",
  "prizeNet": "450.0000000",
  "memo": "PRIZE:prize_01HXYZ",
  "depositTarget": "GVAULT1234567890ABCDEFGHIJ",
  "feeTarget": "GFEEVAULT1234567890ABCDEF",
  "unsignedXdr": "AAAAAgAAAAC...",
  "networkPassphrase": "Public Global Stellar Network ; September 2015",
  "expiresAt": "2025-02-19T12:00:00.000Z",
  "expectedPayments": [
    {
      "asset": "XLM",
      "amount": "450.0000000",
      "destination": "GVAULT1234567890ABCDEFGHIJ"
    },
    {
      "asset": "XLM",
      "amount": "50.0000000",
      "destination": "GFEEVAULT1234567890ABCDEF"
    }
  ],
  "hash": "f6e5d4c3b2a1...",
  "horizonUrl": "https://horizon.stellar.org"
}
```

---

## 9) Consideraciones de seguridad

### Expiración y regeneración

- Cada intent tiene `expiresAt` (ej: now + 24h). Tras esa hora, la XDR no debe aceptarse en la red (timeBounds).
- Si el usuario no paga a tiempo, el prize sigue en PENDING; el job puede marcar EXPIRED cuando expiresAt < now. Regenerar un intent: mismo endpoint con Idempotency-Key distinta (o política definida: si el intent anterior está expirado, permitir crear uno nuevo y actualizar/insertar en DB).

### Evitar replay

- Memo único por prize: "PRIZE:<prizeId>". Una vez el prize pasa a LOCKED, no se acepta un segundo pago como válido para el mismo prize (el watcher solo considera prizes en PENDING).
- Estado del prize: solo se considera depósito para prizes en PENDING; si status ya es LOCKED, ignorar transacciones con ese memo para ese prize (no aplicar dos veces).

### Idempotencia del endpoint payment-intent

- Usar header Idempotency-Key. Si la misma key se reenvía en ventana (ej: 24h), devolver la misma respuesta (mismo paymentIntentId y unsignedXdr) sin crear otro intent.
- Si no hay key idempotente y ya existe un intent no expirado para el prize, devolver 409 CONFLICT o el intent existente según política (recomendado: devolver 200 con el intent existente para no obligar al core a guardar la key).

### Rate limiting

- Aplicar rate limit por creatorPublicKey y/o por prizeId (ej: máx N intents por hora por prize). Evita abuso y sobrecarga a Horizon (sequence, fee_stats).
- Respuestas: 429 Too Many Requests con retry-after cuando se supere el límite.
