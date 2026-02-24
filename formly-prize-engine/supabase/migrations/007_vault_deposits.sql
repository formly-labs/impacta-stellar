-- Registro de todo el dinero que entra al prize vault (polling desde Horizon).
-- Una fila = una tx con pagos al prize vault + fee vault (90% + 10%).
CREATE TABLE IF NOT EXISTS vault_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL UNIQUE,
  payer_public_key TEXT NOT NULL,
  amount_prize_vault TEXT NOT NULL,
  amount_fee_vault TEXT NOT NULL,
  amount_total TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'credit_alphanum4',
  asset_code TEXT,
  asset_issuer TEXT,
  memo TEXT,
  memo_type TEXT,
  ledger_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_deposits_payer ON vault_deposits(payer_public_key);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_ledger_at ON vault_deposits(ledger_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_memo ON vault_deposits(memo) WHERE memo IS NOT NULL;

COMMENT ON TABLE vault_deposits IS 'Depósitos al prize vault (polling Horizon). Una tx = prize vault + fee vault. Consulta por payer o payer+prize.';
