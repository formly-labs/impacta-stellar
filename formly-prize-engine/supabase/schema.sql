-- =============================================================================
-- formly-prize-engine — Schema Supabase/Postgres
-- Fuente: DB.md
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar y ejecutar en orden.
-- =============================================================================

-- 1) ENUMs
CREATE TYPE reward_type AS ENUM ('XLM', 'USDC', 'POINTS');
CREATE TYPE distribution_mode AS ENUM ('LOTTERY_SINGLE', 'SPLIT_EQUAL');
CREATE TYPE prize_status AS ENUM (
  'PENDING', 'LOCKED', 'CLOSED', 'DISTRIBUTED', 'FAILED', 'EXPIRED', 'CANCELLED'
);
CREATE TYPE payout_status AS ENUM ('pending', 'submitted', 'confirmed', 'failed');
CREATE TYPE idempotency_operation AS ENUM (
  'create_prize', 'payment_intent', 'add_entries', 'lock', 'close', 'cancel', 'distribute'
);

-- 2) Función updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Tabla prizes
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
  vault_secret_encrypted TEXT,
  fee_vault_public_key   TEXT,
  memo              TEXT,
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
  WHERE status IN ('PENDING', 'LOCKED', 'CLOSED');
CREATE INDEX idx_prizes_pending_stellar ON prizes(status, draw_at)
  WHERE reward_type IN ('XLM', 'USDC') AND status = 'PENDING';

-- 4) Tabla prize_entries
CREATE TABLE prize_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id  TEXT NOT NULL UNIQUE,
  prize_id     UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  source_id    TEXT,
  amount       NUMERIC(20, 7),
  winner       BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_prize_wallet UNIQUE (prize_id, wallet_address)
);

CREATE INDEX idx_prize_entries_prize_id ON prize_entries(prize_id);
CREATE INDEX idx_prize_entries_prize_id_created_at ON prize_entries(prize_id, created_at);

-- 5) Tabla prize_payment_intents
CREATE TABLE prize_payment_intents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT NOT NULL UNIQUE,
  prize_id        UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  unsigned_xdr    TEXT NOT NULL,
  network_passphrase TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  memo            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_one_active_intent_per_prize UNIQUE (prize_id)
);

-- 6) Tabla prize_payouts
CREATE TABLE prize_payouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id     UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  batch_id     TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount       NUMERIC(20, 7) NOT NULL,
  asset        TEXT NOT NULL,
  tx_hash      TEXT,
  status       payout_status NOT NULL DEFAULT 'pending',
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_payout_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_prize_payouts_prize_id ON prize_payouts(prize_id);
CREATE INDEX idx_prize_payouts_batch_id ON prize_payouts(batch_id);
CREATE INDEX idx_prize_payouts_status ON prize_payouts(prize_id, status);

-- 7) Tabla points_ledger
CREATE TABLE points_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id        UUID NOT NULL REFERENCES prizes(id) ON DELETE RESTRICT,
  wallet_address  TEXT NOT NULL,
  delta_points    NUMERIC(20, 7) NOT NULL,
  reason          TEXT NOT NULL,
  batch_id        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_delta_nonzero CHECK (delta_points <> 0)
);

CREATE INDEX idx_points_ledger_prize_id ON points_ledger(prize_id);
CREATE INDEX idx_points_ledger_batch_id ON points_ledger(batch_id);
CREATE INDEX idx_points_ledger_wallet ON points_ledger(wallet_address);

-- 8) Tabla idempotency_keys
CREATE TABLE idempotency_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash      TEXT NOT NULL,
  operation     idempotency_operation NOT NULL,
  prize_id      UUID,
  resource_id   TEXT,
  request_hash  TEXT,
  response_status INTEGER NOT NULL,
  response_body JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  CONSTRAINT uq_idempotency_key_operation UNIQUE (key_hash, operation)
);

CREATE INDEX idx_idempotency_keys_lookup ON idempotency_keys(key_hash, operation);
CREATE INDEX idx_idempotency_keys_expires ON idempotency_keys(expires_at);

-- 9) Tabla job_runs
CREATE TABLE job_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_mode     TEXT NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ,
  phases       JSONB,
  actions      JSONB,
  error_message TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_runs_started_at ON job_runs(started_at DESC);

-- 10) Tabla distribution_attempts
CREATE TABLE distribution_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id     UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success      BOOLEAN NOT NULL,
  error_code   TEXT,
  error_message TEXT
);

CREATE INDEX idx_distribution_attempts_prize_id ON distribution_attempts(prize_id);

-- 11) RLS (sin políticas: solo service_role accede)
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_attempts ENABLE ROW LEVEL SECURITY;
