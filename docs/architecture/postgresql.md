# PostgreSQL — Architect Cheat Sheet

## ACID
- **Atomicity** — all-or-nothing (transactions).
- **Consistency** — constraints/rules always hold.
- **Isolation** — concurrent txns don't corrupt each other (see levels).
- **Durability** — committed data survives crashes (WAL — write-ahead log).

## Transaction isolation levels (weakest → strongest)
| Level | Prevents | Allows |
|---|---|---|
| Read Uncommitted | (PG treats as Read Committed) | — |
| **Read Committed** (PG default) | dirty reads | non-repeatable + phantom reads |
| **Repeatable Read** | dirty + non-repeatable reads | (PG also blocks phantoms via snapshot) |
| **Serializable** | all anomalies | lowest concurrency (may abort → retry) |
- Anomalies: **dirty read** (see uncommitted), **non-repeatable read** (row changes
  between reads), **phantom read** (new rows match a re-run query).
- MVCC: Postgres uses multi-version concurrency control — readers don't block
  writers and vice versa; each txn sees a snapshot.

## Indexes
- **B-tree** (default) — equality + range + ORDER BY.
- **Hash** — equality only.
- **GIN** — multi-value: JSONB, arrays, full-text search.
- **GiST/SP-GiST** — geometric, ranges, nearest-neighbor.
- **BRIN** — huge, naturally-ordered tables (time-series) — tiny index.
- **Partial** (`WHERE`) and **composite** (multi-column; order matters — leftmost
  prefix rule). **Covering** (`INCLUDE`) → index-only scans.
- Cost: indexes speed reads, slow writes + use space. Index selective columns
  actually used in WHERE/JOIN/ORDER BY.

## Joins
- INNER (matches both), LEFT/RIGHT (keep one side), FULL (both), CROSS (cartesian).
- Planner strategies: nested loop (small), hash join (large unsorted), merge join
  (sorted). You write the join; the planner picks the algorithm.

## Query planning
- `EXPLAIN` (plan) / `EXPLAIN ANALYZE` (plan + real timings). Watch for **Seq Scan**
  on big tables (missing index), bad row estimates (stale stats → `ANALYZE`),
  expensive sorts/nested loops. `pg_stat_statements` for slow-query hunting.

## Schema design
- **Normalization** (1NF→3NF): remove redundancy, one fact one place → integrity.
  **Denormalize** deliberately for read performance (with cache/invalidation).
- Relationships: 1-1, 1-many (FK on the many side), many-many (join table).
- Constraints: PK, FK (+ ON DELETE CASCADE/RESTRICT), UNIQUE, CHECK, NOT NULL.
  Enforce integrity in the DB, not only the app.
- Types: prefer `text`, `timestamptz` (not naive timestamp), `numeric` for money,
  `jsonb` (indexable) over `json`, `uuid`, enums.

## Advanced
- **CTEs** (`WITH`) — readable/recursive queries. **Window functions**
  (`ROW_NUMBER/RANK/LAG/SUM() OVER`) — per-row analytics without collapsing rows.
- **Views** (virtual) vs **materialized views** (stored, `REFRESH`) for expensive
  aggregates.
- **Triggers + functions** (PL/pgSQL) — DB-side automation (audit, derived columns).
- **Partitioning** (range/list/hash) — split huge tables for pruning + maintenance.
- **Full-text search** (`tsvector`/`tsquery` + GIN).

## Operations
- **Connection pooling**: Postgres connections are heavy → use a pooler
  (**PgBouncer**) or the app pool (Prisma pools). Serverless especially needs it.
- **Backups**: `pg_dump` / PITR via WAL archiving. **VACUUM/autovacuum** reclaims
  dead tuples (MVCC bloat).

## Interview signals
- Default isolation is Read Committed; know the anomalies each level prevents.
- Pick index type by access pattern; composite index leftmost-prefix rule.
- Read EXPLAIN: Seq Scan on large tables + bad estimates = red flags.
- Normalize for integrity, denormalize + cache for read scale (deliberate tradeoff).
- Always `timestamptz` and pool connections.
