-- Añade 'tick' a idempotency_operation (para POST /jobs/tick).
-- Añade 'DISTRIBUTING' a prize_status (estado intermedio XLM/USDC hasta payout).
-- Aplicar en Supabase SQL Editor. Si el valor ya existe, puede fallar ADD VALUE (ejecutar una sola vez).

-- Añadir 'tick' a idempotency_operation solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'idempotency_operation' AND e.enumlabel = 'tick'
  ) THEN
    ALTER TYPE idempotency_operation ADD VALUE 'tick';
  END IF;
END
$$;

-- Añadir 'DISTRIBUTING' a prize_status solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'prize_status' AND e.enumlabel = 'DISTRIBUTING'
  ) THEN
    ALTER TYPE prize_status ADD VALUE 'DISTRIBUTING';
  END IF;
END
$$;
