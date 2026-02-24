-- =============================================================================
-- Crear tabla vault_deposits (para polling de depósitos + verify-payment)
-- =============================================================================
-- Uso: si ya tienes el resto del schema pero habías borrado vault_deposits,
-- ejecuta solo este script en Supabase SQL Editor.
-- =============================================================================

CREATE TABLE IF NOT EXISTS vault_deposits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash             TEXT NOT NULL UNIQUE,
  payer_public_key    TEXT NOT NULL,
  amount_prize_vault  NUMERIC(20, 7) NOT NULL,
  amount_fee_vault    NUMERIC(20, 7) NOT NULL DEFAULT 0,
  amount_total        NUMERIC(20, 7) NOT NULL,
  asset_type          TEXT NOT NULL,
  asset_code          TEXT,
  asset_issuer        TEXT,
  memo                TEXT,
  memo_type           TEXT,
  ledger_at           TIMESTAMPTZ NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_deposits_tx_hash ON vault_deposits(tx_hash);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_memo ON vault_deposits(memo) WHERE memo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vault_deposits_ledger_at ON vault_deposits(ledger_at DESC);

ALTER TABLE vault_deposits ENABLE ROW LEVEL SECURITY;
