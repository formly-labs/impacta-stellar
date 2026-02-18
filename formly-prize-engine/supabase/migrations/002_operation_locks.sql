-- Locks para evitar doble ejecución (distribute, jobs/tick).
-- Aplicar en Supabase SQL Editor después del schema principal.

CREATE TABLE IF NOT EXISTS operation_locks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id      TEXT NOT NULL,
  operation     TEXT NOT NULL,
  locked_until  TIMESTAMPTZ NOT NULL,
  owner_id      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_operation_locks_scope_operation UNIQUE (scope_id, operation)
);

CREATE INDEX IF NOT EXISTS idx_operation_locks_locked_until ON operation_locks(locked_until);

ALTER TABLE operation_locks ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo service_role (backend) puede leer/escribir.

COMMENT ON TABLE operation_locks IS 'Locks por scope+operation; locked_until expira para permitir retry.';
