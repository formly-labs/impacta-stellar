# DB — Schema Supabase/Postgres (formly-prize-engine)

Schema mínimo y robusto para el MVP. SQL ejecutable en Postgres (Supabase).

---

## 1) Overview del modelo de datos

- **prizes:** Premio: tipo, montos, fechas, estado, vault (XLM/USDC), referencias de lock/payout y ledger (POINTS). Una fila por premio.
- **prize_entries:** Participaciones: un participante (wallet o user id) por prize; dedupe por (prize_id, wallet_address). Monto y winner se rellenan en distribución.
- **prize_payment_intents:** Intención de pago (XLM/USDC): unsigned_xdr, expires_at, memo; una activa por prize en PENDING.
- **prize_payouts:** Registro por pago individual (on-chain o batch): prize_id, batch_id, destinatario, amount, tx_hash, status. Soporta batch vía batch_id.
- **points_ledger:** Movimientos off-chain de POINTS: prize_id, participante, delta, reason, batch_id. Auditoría y saldos.
- **idempotency_keys:** Claves de idempotencia por operación (create_prize, payment_intent, entries, lock, close, cancel, distribute); ventana de validez.
- **job_runs:** Auditoría de ejecuciones del job tick: run_mode, fases, acciones, errores.

Relaciones: prizes 1 — N prize_entries; prizes 1 — N prize_payouts (o 1 batch); prizes 1 — N points_ledger (por batch); prizes 0..1 prize_payment_intents (activo).

---

## 2) Enumeraciones (Postgres ENUMs)

Se usan ENUMs para status, reward_type y distribution_mode. Alternativa válida: CHECK con texto.

```sql
-- Enums reutilizables
CREATE TYPE reward_type AS ENUM ('XLM', 'USDC', 'POINTS');
CREATE TYPE distribution_mode AS ENUM ('LOTTERY_SINGLE', 'SPLIT_EQUAL');
CREATE TYPE prize_status AS ENUM (
  'PENDING', 'LOCKED', 'CLOSED', 'DISTRIBUTED', 'FAILED', 'EXPIRED', 'CANCELLED'
);
CREATE TYPE payout_status AS ENUM ('pending', 'submitted', 'confirmed', 'failed');
CREATE TYPE idempotency_operation AS ENUM (
  'create_prize', 'payment_intent', 'add_entries', 'lock', 'close', 'cancel', 'distribute'
);

-- Función para updated_at (usar antes de crear triggers)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 3) Tablas (SQL ejecutable)

### A) prizes

```sql
CREATE TABLE prizes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id       TEXT NOT NULL UNIQUE,  -- expuesto en API como prizeId (ej: prize_01HXYZ)
  form_id           TEXT,                  -- id del formulario en core (opcional)
  creator_user_id   TEXT,                  -- id del creador en core (opcional)
  reward_type       reward_type NOT NULL,
  distribution_mode distribution_mode NOT NULL,
  amount_total      NUMERIC(20, 7) NOT NULL,
  fee_bps           INTEGER NOT NULL DEFAULT 1000,
  fee_amount        NUMERIC(20, 7) NOT NULL DEFAULT 0,
  prize_net         NUMERIC(20, 7) NOT NULL DEFAULT 0,
  close_at          TIMESTAMPTZ NOT NULL,
  draw_at           TIMESTAMPTZ NOT NULL,
  status            prize_status NOT NULL DEFAULT 'PENDING',
  vault_public_key  TEXT,                  -- G... solo XLM/USDC
  vault_secret_encrypted TEXT,            -- cifrado; solo backend
  fee_vault_public_key   TEXT,             -- vault que recibe fees (opcional MVP)
  memo              TEXT,                 -- memo para pagos (ej: external_id)
  lock_ref          TEXT,                 -- tx hash depósito (XLM/USDC)
  payout_ref        TEXT,                 -- tx hash o batch id on-chain (XLM/USDC)
  payout_result     JSONB,                -- snapshot del result (winners, amounts)
  ledger_batch_id   TEXT,                 -- batch POINTS (points_ledger.batch_id)
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

```

```sql
CREATE TRIGGER set_prizes_updated_at
  BEFORE UPDATE ON prizes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### B) prize_entries

```sql
CREATE TABLE prize_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id  TEXT NOT NULL UNIQUE,       -- expuesto en API como entryId
  prize_id     UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,            -- G... (XLM/USDC) o user_id (POINTS)
  source_id    TEXT,                       -- form_response_id u otro id en core
  amount       NUMERIC(20, 7),            -- asignado en distribución
  winner       BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_prize_wallet UNIQUE (prize_id, wallet_address)
);

CREATE INDEX idx_prize_entries_prize_id ON prize_entries(prize_id);
```

### C) prize_payment_intents (XLM/USDC)

```sql
CREATE TABLE prize_payment_intents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT NOT NULL UNIQUE,
  prize_id        UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  unsigned_xdr    TEXT NOT NULL,
  network_passphrase TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  memo            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_one_active_intent_per_prize UNIQUE (prize_id)  -- 1 intent activo por prize
);
```

(Nota: si se permiten varios intents por prize —p.ej. tras expiración— quitar UNIQUE (prize_id) y usar status o “activo” por expires_at; en MVP 1 activo por prize.)

### D) prize_payouts (soporta batch)

```sql
CREATE TABLE prize_payouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id     UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  batch_id     TEXT NOT NULL,             -- mismo valor para un batch de pago
  wallet_address TEXT NOT NULL,
  amount       NUMERIC(20, 7) NOT NULL,
  asset        TEXT NOT NULL,             -- 'XLM' | 'USDC'
  tx_hash      TEXT,
  status       payout_status NOT NULL DEFAULT 'pending',
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_payout_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_prize_payouts_prize_id ON prize_payouts(prize_id);
CREATE INDEX idx_prize_payouts_batch_id ON prize_payouts(batch_id);
CREATE INDEX idx_prize_payouts_status ON prize_payouts(prize_id, status);
```

### E) points_ledger (POINTS)

```sql
CREATE TABLE points_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id        UUID NOT NULL REFERENCES prizes(id) ON DELETE RESTRICT,
  wallet_address  TEXT NOT NULL,         -- user_id del participante
  delta_points    NUMERIC(20, 7) NOT NULL,
  reason          TEXT NOT NULL,          -- ej: 'prize_distribution'
  batch_id        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_delta_nonzero CHECK (delta_points <> 0)
);

CREATE INDEX idx_points_ledger_prize_id ON points_ledger(prize_id);
CREATE INDEX idx_points_ledger_batch_id ON points_ledger(batch_id);
CREATE INDEX idx_points_ledger_wallet ON points_ledger(wallet_address);
```

(Opcional: tabla `user_balances` para saldo actual por usuario; el PRD la menciona. Para MVP se puede derivar con SUM(delta_points) o añadir después.)

### F) idempotency_keys

```sql
CREATE TABLE idempotency_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash      TEXT NOT NULL,            -- hash del header Idempotency-Key (ej. SHA256)
  operation     idempotency_operation NOT NULL,
  prize_id      UUID,                    -- cuando aplica (null en create_prize hasta tener id)
  resource_id   TEXT,                    -- prize external_id u otro para lookup
  request_hash  TEXT,                    -- hash del body (opcional)
  response_status INTEGER NOT NULL,
  response_body JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  CONSTRAINT uq_idempotency_key_operation UNIQUE (key_hash, operation)
);

CREATE INDEX idx_idempotency_keys_lookup ON idempotency_keys(key_hash, operation);
CREATE INDEX idx_idempotency_keys_expires ON idempotency_keys(expires_at);
```

### G) job_runs (auditoría de ticks)

```sql
CREATE TABLE job_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_mode     TEXT NOT NULL,             -- 'execute' | 'dry_run'
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ,
  phases       JSONB,                    -- { depositsChecked, depositsLocked, closed, distributed, failed }
  actions      JSONB,                    -- [{ prizeId, action, detail }]
  error_message TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_runs_started_at ON job_runs(started_at DESC);
```

### H) distribution_attempts (auditoría de intentos de distribución)

```sql
CREATE TABLE distribution_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id     UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success      BOOLEAN NOT NULL,
  error_code   TEXT,
  error_message TEXT
);

CREATE INDEX idx_distribution_attempts_prize_id ON distribution_attempts(prize_id);
```

---

## 4) Reglas y constraints (resumen)

### Unique

| Tabla | Constraint | Uso |
|-------|------------|-----|
| prizes | external_id UNIQUE | Identificador público estable |
| prize_entries | (prize_id, wallet_address) UNIQUE | Dedupe: un entry por wallet por prize |
| prize_payment_intents | (prize_id) UNIQUE | MVP: un intent activo por prize (relajar si se permiten reintentos con nuevo intent) |
| idempotency_keys | (key_hash, operation) UNIQUE | Una respuesta por clave+operación |

### Check

| Tabla | Constraint | Regla |
|-------|------------|--------|
| prizes | chk_amount_total_positive | amount_total > 0 |
| prizes | chk_fee_bps_range | fee_bps entre 0 y 10000 |
| prizes | chk_draw_after_close | draw_at >= close_at |
| prizes | chk_vault_for_stellar | vault_public_key NOT NULL solo para XLM/USDC |
| prize_entries | — | amount puede ser NULL hasta distribución |
| prize_payouts | chk_payout_amount_positive | amount > 0 |
| points_ledger | chk_delta_nonzero | delta_points <> 0 |

### Foreign keys y ON DELETE

| Tabla | FK | ON DELETE |
|-------|-----|-----------|
| prize_entries | prize_id → prizes(id) | CASCADE (borrar prize borra entries) |
| prize_payment_intents | prize_id → prizes(id) | CASCADE |
| prize_payouts | prize_id → prizes(id) | CASCADE |
| points_ledger | prize_id → prizes(id) | RESTRICT (evitar borrar prize con ledger) |
| distribution_attempts | prize_id → prizes(id) | CASCADE |
| idempotency_keys | prize_id opcional, sin FK | — |

---

## 5) Índices

| Índice | Tabla | Motivo |
|--------|--------|--------|
| idx_prize_entries_prize_id | prize_entries | Listar entries por prize; distribución |
| idx_prize_payouts_prize_id | prize_payouts | Consultar payouts por prize |
| idx_prize_payouts_batch_id | prize_payouts | Agrupar por batch |
| idx_prize_payouts_status | prize_payouts(prize_id, status) | Filtrar pendientes/confirmados por prize |
| idx_points_ledger_prize_id | points_ledger | Auditoría por prize |
| idx_points_ledger_batch_id | points_ledger | Agrupar por batch |
| idx_points_ledger_wallet | points_ledger | Saldo por usuario (SUM por wallet) |
| idx_idempotency_keys_lookup | idempotency_keys(key_hash, operation) | Lookup en POST idempotente |
| idx_idempotency_keys_expires | idempotency_keys(expires_at) | Limpieza de keys expiradas |
| idx_job_runs_started_at | job_runs(started_at DESC) | Listar runs recientes |
| idx_distribution_attempts_prize_id | distribution_attempts(prize_id) | Historial de intentos por prize |

Índices para el job tick (queries por status y fechas):

```sql
CREATE INDEX idx_prizes_status_close_draw ON prizes(status, close_at, draw_at)
  WHERE status IN ('PENDING', 'LOCKED', 'CLOSED');
CREATE INDEX idx_prizes_pending_stellar ON prizes(status, draw_at)
  WHERE reward_type IN ('XLM', 'USDC') AND status = 'PENDING';
```

---

## 6) Campos obligatorios por tabla (mínimos)

### prizes

- **Identificación:** id, external_id (único).
- **Contexto:** form_id (opcional), creator_user_id (opcional).
- **Config:** reward_type, distribution_mode, amount_total, fee_bps, fee_amount, prize_net, close_at, draw_at, status.
- **Vault (XLM/USDC):** vault_public_key, vault_secret_encrypted (nullable), fee_vault_public_key (opcional), memo.
- **Proofs:** lock_ref, payout_ref, payout_result (JSONB), ledger_batch_id (POINTS), locked_at, distributed_at.
- **Auditoría:** created_at, updated_at.

### prize_entries

- prize_id (FK), wallet_address, source_id (opcional), amount (nullable hasta distribución), winner (default false), created_at. external_id (único) para API.

### prize_payment_intents

- prize_id, unsigned_xdr, expires_at, memo, network_passphrase (opcional), external_id, created_at.

### prize_payouts

- prize_id, batch_id, wallet_address, amount, asset, tx_hash (tras envío), status, attempts, last_error, created_at, updated_at.

### points_ledger

- prize_id, wallet_address, delta_points, reason, batch_id, created_at.

### idempotency_keys

- key_hash, operation, prize_id (opcional), resource_id (opcional), request_hash (opcional), response_status, response_body (o response_body_hash), created_at, expires_at.

### job_runs

- run_mode, started_at, finished_at (opcional), phases (JSONB), actions (JSONB), error_message (opcional), created_at.

---

## 7) RLS (Row Level Security)

**Recomendación MVP (Opción A):** El backend usa solo la clave **service_role** de Supabase. No se exponen tablas a anon ni a authenticated. RLS activado en todas las tablas y **sin políticas que concedan acceso**; así solo service_role (bypass RLS) puede leer/escribir.

```sql
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_attempts ENABLE ROW LEVEL SECURITY;

-- No crear políticas para anon/authenticated: acceso solo vía service_role.
-- (En Supabase, service_role ignora RLS por defecto.)
```

**Opción B (si algún día se usa anon/authenticated):** Definir políticas por tabla, por ejemplo “solo servicio” con un claim o rol:

```sql
-- Ejemplo: solo rol 'service' puede todo (requiere JWT con role = service)
CREATE POLICY "service_all_prizes" ON prizes
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service');
-- Repetir FOR ALL en cada tabla o usar roles de Postgres.
```

Para MVP basta con **Opción A**: RLS ON, sin políticas, acceso exclusivo con service_role.

---

## 8) Migración y seed / variables de entorno

### Orden sugerido de migración

1. Crear ENUMs.
2. Crear función `set_updated_at()` si se usa.
3. Crear tabla `prizes`.
4. Crear tablas que referencian `prizes`: prize_entries, prize_payment_intents, prize_payouts, points_ledger, distribution_attempts.
5. Crear idempotency_keys y job_runs.
6. Crear índices adicionales (incluidos los de status/close_at/draw_at).
7. Habilitar RLS en todas las tablas.

### Valores por entorno (env)

| Variable | Uso |
|----------|-----|
| SUPABASE_URL | URL del proyecto Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Clave service_role para backend (no exponer al cliente) |
| STELLAR_NETWORK_PASSPHRASE | Passphrase de red (Public/Test) |
| STELLAR_HORIZON_URL | URL del Horizon para watcher y envío de txs |
| FEE_VAULT_PUBLIC_KEY | (Opcional) Cuenta que recibe fees |
| VAULT_MASTER_ENCRYPTION_KEY o KMS_KEY_ID | Cifrado de vault_secret_encrypted |
| PAYMENT_INTENT_EXPIRY_HOURS | Ventana de validez del payment intent (ej: 24) |
| IDEMPOTENCY_TTL_HOURS | Ventana de idempotencia (ej: 24) |

### Seed (opcional)

- No hay datos mínimos obligatorios. Para pruebas: insertar un prize POINTS en PENDING, un prize USDC en LOCKED con close_at/draw_at futuros, y algunas prize_entries asociadas.

### Notas

- **external_id:** Generar con nanoid o prefijo + nanoid (ej: `prize_` + nanoid()) y guardar en `prizes.external_id` y equivalente en entries/payment_intents.
- **key_hash en idempotency_keys:** Almacenar SHA256(Idempotency-Key) para no guardar la clave en claro.
- **vault_secret_encrypted:** Cifrar con VAULT_MASTER_ENCRYPTION_KEY o KMS antes de insertar; desencriptar solo en el proceso que firma payouts.
