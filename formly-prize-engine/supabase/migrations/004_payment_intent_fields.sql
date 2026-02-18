-- Añade payment_intent_hash a prize_payment_intents para auditoría/validación.
-- prizes ya tiene memo, vault_public_key. fee_vault viene de env (FEE_VAULT_PUBLIC_KEY).

ALTER TABLE prize_payment_intents
  ADD COLUMN IF NOT EXISTS intent_hash TEXT;
