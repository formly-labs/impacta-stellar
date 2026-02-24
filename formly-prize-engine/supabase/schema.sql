-- =============================================================================
-- formly-prize-engine — Create database from scratch
-- =============================================================================
-- 1) For full reset: run supabase/scripts/drop_everything.sql first
-- 2) Then run this file in Supabase Dashboard → SQL Editor
-- =============================================================================

-- 1) ENUMs
CREATE TYPE reward_type AS ENUM ('XLM', 'USDC', 'POINTS');
CREATE TYPE distribution_mode AS ENUM ('LOTTERY_SINGLE', 'SPLIT_EQUAL');
CREATE TYPE prize_status AS ENUM (
  'PENDING',
  'AWAITING_PAYMENT_CONFIRMATION',
  'LOCKED',
  'CLOSED',
  'DISTRIBUTED',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
  'DISTRIBUTING'
);

-- 2) updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) prizes table (no vault_secret_encrypted or fee_vault_public_key)
CREATE TABLE prizes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id       TEXT NOT NULL UNIQUE,
  form_id           TEXT,
  creator_user_id   TEXT,
  reward_type       reward_type NOT NULL,
  distribution_mode distribution_mode NOT NULL,
  amount_total      NUMERIC(20, 7) NOT NULL,
  fee_bps           INTEGER NOT NULL DEFAULT 1000,
  fee_amount        NUMERIC(20, 7) NOT NULL DEFAULT 0,
  prize_net         NUMERIC(20, 7) NOT NULL DEFAULT 0,
  close_at          TIMESTAMPTZ NOT NULL,
  draw_at           TIMESTAMPTZ NOT NULL,
  status            prize_status NOT NULL DEFAULT 'PENDING',
  vault_public_key  TEXT,
  memo              TEXT,
  memo_type         TEXT,
  lock_ref          TEXT,
  payout_ref        TEXT,
  payout_result     JSONB,
  ledger_batch_id   TEXT,
  locked_at         TIMESTAMPTZ,
  distributed_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_amount_total_positive CHECK (amount_total > 0),
  CONSTRAINT chk_fee_bps_range CHECK (fee_bps >= 0 AND fee_bps <= 10000),
  CONSTRAINT chk_draw_after_close CHECK (draw_at >= close_at),
  CONSTRAINT chk_vault_for_stellar CHECK (
    (reward_type IN ('XLM', 'USDC') AND vault_public_key IS NOT NULL) OR
    (reward_type = 'POINTS' AND vault_public_key IS NULL)
  )
);

CREATE TRIGGER set_prizes_updated_at
  BEFORE UPDATE ON prizes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_prizes_status_close_draw ON prizes(status, close_at, draw_at)
  WHERE status IN ('PENDING', 'LOCKED', 'CLOSED', 'AWAITING_PAYMENT_CONFIRMATION');
CREATE INDEX idx_prizes_pending_stellar ON prizes(status, draw_at)
  WHERE reward_type IN ('XLM', 'USDC') AND status = 'AWAITING_PAYMENT_CONFIRMATION';

-- 4) prize_payment_intents table (with intent_hash)
CREATE TABLE prize_payment_intents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id         TEXT NOT NULL UNIQUE,
  prize_id            UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  unsigned_xdr        TEXT NOT NULL,
  network_passphrase  TEXT,
  expires_at           TIMESTAMPTZ NOT NULL,
  memo                TEXT,
  intent_hash         TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_one_active_intent_per_prize UNIQUE (prize_id)
);

-- 5) operation_locks table (for jobs / concurrency)
CREATE TABLE operation_locks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id     TEXT NOT NULL,
  operation    TEXT NOT NULL,
  locked_until TIMESTAMPTZ NOT NULL,
  owner_id     TEXT NOT NULL,
  CONSTRAINT uq_scope_operation UNIQUE (scope_id, operation)
);

CREATE INDEX idx_operation_locks_scope_operation ON operation_locks(scope_id, operation);

-- 6) vault_deposits table (polling writes here; verify-payment reads)
CREATE TABLE vault_deposits (
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

CREATE INDEX idx_vault_deposits_tx_hash ON vault_deposits(tx_hash);
CREATE INDEX idx_vault_deposits_memo ON vault_deposits(memo) WHERE memo IS NOT NULL;
CREATE INDEX idx_vault_deposits_ledger_at ON vault_deposits(ledger_at DESC);

-- 7) RLS (no policies: only service_role accesses)
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_deposits ENABLE ROW LEVEL SECURITY;
