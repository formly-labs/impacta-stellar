-- Watcher: memo_type en prizes y estado AWAITING_PAYMENT_CONFIRMATION.
-- prizes ya tiene memo, prize_net, fee_amount, lock_ref, locked_at.

-- Añadir memo_type solo si no existe (text | hash, default text)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prizes' AND column_name = 'memo_type'
  ) THEN
    ALTER TABLE prizes ADD COLUMN memo_type TEXT DEFAULT 'text'
      CHECK (memo_type IS NULL OR memo_type IN ('text', 'hash'));
  END IF;
END
$$;

-- Añadir AWAITING_PAYMENT_CONFIRMATION a prize_status solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'prize_status' AND e.enumlabel = 'AWAITING_PAYMENT_CONFIRMATION'
  ) THEN
    ALTER TYPE prize_status ADD VALUE 'AWAITING_PAYMENT_CONFIRMATION';
  END IF;
END
$$;

-- El índice que usa AWAITING_PAYMENT_CONFIRMATION está en 006_watcher_index.sql.
-- Ejecutar 005, luego 006 (el nuevo valor de enum debe confirmarse antes de usarlo).
