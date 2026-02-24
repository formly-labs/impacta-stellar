# Flujo del engine

## 1. Crear premio
`POST /api/v1/prizes` — body: `rewardType`, `distributionMode`, `prizeAmount`, `feePercent` (opcional).  
Respuesta: `{ prize: { prizeId, status: "AWAITING_PAYMENT_CONFIRMATION", ... } }`.

## 2. Obtener XDR para firmar
`POST /api/v1/prizes/:prizeId/payment-intent` — body: `payerPublicKey` (wallet que pagará).  
Respuesta: `unsignedXdr`, `memo`, `depositTarget`, `feeTarget`, `expiresAt`, `expectedPayments`, etc.  
El cliente firma la XDR con esa wallet y envía la transacción a Stellar.

## 3. Polling (automático)
Un **solo** proceso de polling (config: `DEPOSIT_POLL_ENABLED`, `DEPOSIT_POLL_INTERVAL_MS`):

- Escucha las transacciones que llegan a **PRIZE_VAULT_PUBLIC_KEY** (y en la misma tx a **FEE_VAULT_PUBLIC_KEY**).
- Por cada tx guarda en **vault_deposits**: quién pagó, montos al prize vault y al fee vault, token (XLM/USDC), memo, tiempo.
- Idempotente por `tx_hash`.

No se llama por API; corre en background al iniciar el servidor.

## 4. Verificar pago
`POST /api/v1/prizes/:prizeId/verify-payment` — **solo prizeId en la URL**. Body opcional: `{}` o `{ "txHash": "..." }`.

- Consulta **solo la base de datos** (`vault_deposits`). No llama a Horizon.
- El premio ya tiene en BD cuánto debía llegar y en qué token; se busca un depósito con memo coincidente y monto ≥ prize_net.
- Si hay depósito válido, marca el premio como **LOCKED**.

## 5. Pagar a destinatarios
`POST /api/v1/prizes/:prizeId/pay` — body: `destinations: ["G...", ...]`.  
El premio debe estar **LOCKED** o **CLOSED**. Envía `prize_net` desde el prize vault a las wallets indicadas.

---

**Resumen:** Polling rellena `vault_deposits`; verify-payment solo lee esa tabla por `prizeId` y, si aplica, marca LOCKED.
