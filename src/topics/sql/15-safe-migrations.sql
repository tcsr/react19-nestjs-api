-- ============================================================================
-- 15 — SAFE / PRODUCTION MIGRATIONS
-- The other demo files DROP their demo_* tables on purpose (isolated scratch).
-- PRODUCTION IS DIFFERENT: tables hold real data. NEVER DROP/TRUNCATE a live table
-- or drop a column that's still read. Change the schema ADDITIVELY and reversibly.
-- This file shows the SAFE patterns (it uses one demo_* table so it's still
-- runnable, but every statement models a production-safe move).
-- ============================================================================

-- Idempotent create: safe to re-run, won't error if it already exists.
CREATE TABLE IF NOT EXISTS demo_accounts (
  id    SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name  TEXT
);
INSERT INTO demo_accounts (email, name)
SELECT 'u'||g||'@x.com', 'User '||g FROM generate_series(1,5) g
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- RULE 1: add columns NULLABLE (or with a default) — never NOT NULL without a
-- default on a populated table (that rewrites/locks the whole table).
-- ---------------------------------------------------------------------------
ALTER TABLE demo_accounts ADD COLUMN IF NOT EXISTS status TEXT;      -- nullable first

-- Backfill in BATCHES to avoid one giant long-held lock / bloat on huge tables.
UPDATE demo_accounts SET status = 'active' WHERE status IS NULL;     -- (batch in reality)

-- Now it's safe to tighten the constraint (data is populated).
ALTER TABLE demo_accounts ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE demo_accounts ALTER COLUMN status SET NOT NULL;

-- ---------------------------------------------------------------------------
-- RULE 2: build indexes WITHOUT locking writes on live tables.
-- CREATE INDEX CONCURRENTLY doesn't block reads/writes (can't run inside a txn).
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_email ON demo_accounts(email);

-- ---------------------------------------------------------------------------
-- RULE 3: SOFT DELETE instead of DELETE — keep the data, hide it.
-- Real deletes are irreversible + break FKs/audit. Mark rows deleted, filter them.
-- ---------------------------------------------------------------------------
ALTER TABLE demo_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- "Delete" a row:
UPDATE demo_accounts SET deleted_at = now() WHERE id = 1;
-- Read only live rows (partial index keeps this fast):
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_live
  ON demo_accounts(id) WHERE deleted_at IS NULL;
SELECT id, email FROM demo_accounts WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- RULE 4: RENAME/REMOVE via EXPAND–CONTRACT (multi-deploy), never in one shot.
--   Expand : add the new column, write to BOTH (app or trigger), backfill.
--   Migrate: switch reads to the new column, deploy.
--   Contract: only after nothing reads the old column, drop it (later release).
-- ---------------------------------------------------------------------------
ALTER TABLE demo_accounts ADD COLUMN IF NOT EXISTS full_name TEXT;   -- expand
UPDATE demo_accounts SET full_name = name WHERE full_name IS NULL;   -- backfill
-- (deploy app that writes+reads full_name) ... then a LATER migration:
-- ALTER TABLE demo_accounts DROP COLUMN name;   -- contract (only when unused)

-- ---------------------------------------------------------------------------
-- RULE 5: wrap multi-step DDL/DML in a transaction so a failure rolls back
-- (note: CREATE INDEX CONCURRENTLY must be OUTSIDE a transaction).
-- ---------------------------------------------------------------------------
BEGIN;
  ALTER TABLE demo_accounts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
  UPDATE demo_accounts SET locale = 'en' WHERE locale IS NULL;
COMMIT;

-- ---------------------------------------------------------------------------
-- WHAT NOT TO DO IN PRODUCTION (destructive — data loss / downtime):
--   DROP TABLE accounts;              -- gone forever
--   TRUNCATE accounts;               -- wipes all rows
--   DELETE FROM accounts;            -- (no WHERE) wipes all rows
--   ALTER TABLE ... ADD COLUMN x NOT NULL;   -- full rewrite + lock, fails on data
--   ALTER TABLE ... DROP COLUMN still_read_by_app;   -- breaks running code
--   UPDATE/DELETE without WHERE      -- always scope it; test with SELECT first
-- Always: backup / PITR before risky changes, run in a transaction where possible,
-- and test the migration on a staging copy first.
-- ---------------------------------------------------------------------------

-- Demo cleanup (SCRATCH ONLY — you would NEVER drop a real table).
DROP TABLE IF EXISTS demo_accounts;
