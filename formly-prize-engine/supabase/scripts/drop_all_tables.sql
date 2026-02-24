-- =============================================================================
-- Borrar todas las tablas del formly-prize-engine (reset completo)
-- =============================================================================
-- Uso: Supabase Dashboard → SQL Editor → pegar y ejecutar.
-- CUIDADO: borra todos los datos. Úsalo para dev o para dejar la DB limpia
-- antes de volver a aplicar schema.sql.
--
-- Si solo quieres quitar columnas que ya no se usan (sin borrar tablas), ejecuta
-- antes: supabase/scripts/drop_unused_columns.sql
-- =============================================================================

-- Tablas que referencian a prizes (eliminar primero por FK)
DROP TABLE IF EXISTS prize_entries CASCADE;
DROP TABLE IF EXISTS prize_payment_intents CASCADE;
DROP TABLE IF EXISTS prize_payouts CASCADE;
DROP TABLE IF EXISTS points_ledger CASCADE;
DROP TABLE IF EXISTS distribution_attempts CASCADE;
-- vault_deposits no referencia prizes; el engine la usa para polling + verify-payment
DROP TABLE IF EXISTS vault_deposits CASCADE;

-- Tablas independientes
DROP TABLE IF EXISTS idempotency_keys CASCADE;
DROP TABLE IF EXISTS job_runs CASCADE;
DROP TABLE IF EXISTS operation_locks CASCADE;

-- Tabla principal
DROP TABLE IF EXISTS prizes CASCADE;

-- Opcional: eliminar tipos ENUM si quieres un schema 100% limpio
-- (solo si no los vas a recrear en la misma sesión; si aplicas schema.sql después, los crea de nuevo)
-- DROP TYPE IF EXISTS payout_status CASCADE;
-- DROP TYPE IF EXISTS idempotency_operation CASCADE;
-- DROP TYPE IF EXISTS prize_status CASCADE;
-- DROP TYPE IF EXISTS distribution_mode CASCADE;
-- DROP TYPE IF EXISTS reward_type CASCADE;

-- Función compartida (opcional)
-- DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- =============================================================================
-- Después de ejecutar: aplica de nuevo el schema para recrear tablas.
-- El engine actual solo usa: prizes, prize_payment_intents, operation_locks.
-- Si usas schema.sql completo, tendrás tablas extra (entries, payouts, etc.)
-- que ya no usa el código; si prefieres solo lo necesario, aplica solo esas 3.
-- =============================================================================
