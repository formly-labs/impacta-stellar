# Engine flow

## 1. Create prize
`POST /api/v1/prizes` — body: `rewardType`, `distributionMode`, `prizeAmount`, `feePercent` (optional).  
Response: `{ prize: { prizeId, status: "AWAITING_PAYMENT_CONFIRMATION", ... } }`.

## 2. Get XDR to sign
`POST /api/v1/prizes/:prizeId/payment-intent` — body: `payerPublicKey` (wallet that will pay).  
Response: `unsignedXdr`, `memo`, `depositTarget`, `feeTarget`, `expiresAt`, `expectedPayments`, etc.  
The client signs the XDR with that wallet and submits the transaction to Stellar.

## 3. Polling (automatic)
A **single** polling process (config: `DEPOSIT_POLL_ENABLED`, `DEPOSIT_POLL_INTERVAL_MS`):

- Listens for transactions to **PRIZE_VAULT_PUBLIC_KEY** (and in the same tx to **FEE_VAULT_PUBLIC_KEY**).
- For each tx stores in **vault_deposits**: who paid, amounts to prize vault and fee vault, token (XLM/USDC), memo, time.
- Idempotent by `tx_hash`.

Not called via API; runs in the background when the server starts.

## 4. Verify payment
`POST /api/v1/prizes/:prizeId/verify-payment` — **only prizeId in the URL**. Optional body: `{}` or `{ "txHash": "..." }`.

- Queries **only the database** (`vault_deposits`). Does not call Horizon.
- The prize already has in DB how much was expected and which token; we look for a deposit with matching memo and amount ≥ prize_net.
- If a valid deposit exists, the prize is marked **LOCKED**.

## 5. Pay to destinations
`POST /api/v1/prizes/:prizeId/pay` — body: `destinations: ["G...", ...]`.  
The prize must be **LOCKED** or **CLOSED**. Sends `prize_net` from the prize vault to the given wallets.

---

**Summary:** Polling fills `vault_deposits`; verify-payment only reads that table by `prizeId` and, when applicable, marks LOCKED.
