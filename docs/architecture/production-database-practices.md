# Production Database Practices — Architect Cheat Sheet

Runnable patterns: `src/topics/sql/15-safe-migrations.sql`. The demo files DROP
their `demo_*` tables **on purpose** (isolated scratch). Production tables hold real
data — the rules below apply there.

## Golden rule
**Never run a destructive statement on a table with real data.** No `DROP TABLE`,
`TRUNCATE`, `DELETE`/`UPDATE` without a `WHERE`, or dropping a column the app still
reads. Data loss is usually irreversible and outages are expensive.

## Migrations must be SAFE + REVERSIBLE
- **Additive first**: add columns **nullable** or with a default. `NOT NULL` without
  a default on a populated table rewrites + locks it (and fails if rows exist).
- **Backfill in batches** (e.g. 1–10k rows/loop) to avoid one long lock + table
  bloat; then tighten the constraint once data is filled.
- **Indexes**: `CREATE INDEX CONCURRENTLY` on live tables (doesn't block writes;
  can't run in a transaction). Plain `CREATE INDEX` locks writes.
- **Idempotent**: `IF NOT EXISTS` / `IF EXISTS` so re-runs don't fail.
- **Transactional** where possible so a failed step rolls back (except CONCURRENTLY).
- **Test on staging** (a restored copy) before prod; take a backup first.

## Expand–Contract (zero-downtime rename/remove)
Old and new code run simultaneously during a rolling deploy, so you can't change a
column in one shot. Do it across releases:
1. **Expand** — add the new column; write to BOTH old + new (app or trigger); backfill.
2. **Migrate** — switch reads to the new column; deploy.
3. **Contract** — only after NOTHING reads the old column, drop it (a later release).

Same idea for renames, type changes, splitting/merging tables.

## Soft delete instead of hard delete
- Add `deleted_at TIMESTAMPTZ NULL`; "delete" = `SET deleted_at = now()`.
- Read live rows with `WHERE deleted_at IS NULL` (partial index keeps it fast).
- Preserves history/audit/FK integrity and allows undo. Purge truly old rows later
  via a controlled, batched, backed-up job (compliance/retention).
- In the app: a repository/Prisma middleware can auto-filter `deleted_at IS NULL`.

## Backups & recovery
- Automated backups + **PITR** (point-in-time recovery via WAL archiving). Know your
  **RPO** (max data loss) and **RTO** (max downtime). **Test restores** — an
  untested backup isn't a backup. Snapshot before any risky migration.

## Access control
- App connects as a **least-privilege** user (DML only; no DROP/DDL in the app
  role). DDL/migrations run via a separate migration role in CI/CD, not ad-hoc.
- No manual queries against prod; if unavoidable, `BEGIN; ... ` + verify with a
  `SELECT` before `COMMIT`, and scope every `UPDATE/DELETE` with a `WHERE`.

## Concurrency & integrity at scale
- Enforce integrity in the DB (FK, UNIQUE, CHECK, NOT NULL) — not only app code.
- Guard money/stock updates with row locks (`FOR UPDATE`) or atomic
  `SET qty = qty - 1 WHERE qty >= 1`; use `SKIP LOCKED` for job queues.
- Lock rows in a consistent order to avoid deadlocks; keep transactions short.

## App-side (NestJS) production hooks
- **Migrations in CI/CD**: `prisma migrate deploy` (applies pending only) on release
  — never `migrate dev`/`db push` against prod.
- **Graceful shutdown**: `app.enableShutdownHooks()` → stop accepting traffic, drain
  in-flight, `prisma.$disconnect()` on SIGTERM.
- **Connection pooling**: size the pool to the DB limit; PgBouncer for serverless.
- **Health checks**: readiness pings the DB (see `/health`).

## Interview signals
- Migrations are additive + reversible; destructive changes use expand–contract
  across releases (zero downtime).
- Soft delete over hard delete for user data; hard-purge is a separate, controlled,
  backed-up job.
- `CREATE INDEX CONCURRENTLY`, batched backfills, nullable-then-tighten — because
  DDL takes locks.
- Least-privilege app role; migrations via CI; backups with tested restores + PITR.
