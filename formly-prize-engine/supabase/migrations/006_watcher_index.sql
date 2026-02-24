-- Índice para listAwaitingPayment. Ejecutar DESPUÉS de 005_watcher_fields.sql
-- (el nuevo valor de enum debe estar confirmado antes de usarlo en WHERE).
CREATE INDEX IF NOT EXISTS idx_prizes_awaiting_payment
  ON prizes(status, reward_type)
  WHERE status = 'AWAITING_PAYMENT_CONFIRMATION' AND lock_ref IS NULL AND reward_type IN ('XLM', 'USDC');
