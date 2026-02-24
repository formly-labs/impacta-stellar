-- =============================================================================
-- Borrar columnas que el engine ya no usa
-- =============================================================================
-- Uso: Supabase Dashboard → SQL Editor → pegar y ejecutar.
-- =============================================================================

-- prizes: el código no usa vault_secret_encrypted ni fee_vault_public_key
-- (el vault y fee vault vienen de env, no se guardan por premio)
ALTER TABLE prizes DROP COLUMN IF EXISTS vault_secret_encrypted;
ALTER TABLE prizes DROP COLUMN IF EXISTS fee_vault_public_key;
