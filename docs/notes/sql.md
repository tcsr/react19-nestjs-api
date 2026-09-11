# PostgreSQL Queries — Study Notes

Runnable: `src/topics/sql/*.sql` · Deep: `docs/architecture/postgresql.md`

## Joins
- INNER (matches both) · LEFT/RIGHT (keep one side, NULLs for missing) · FULL (both)
  · CROSS (cartesian) · SELF (table to itself, e.g. emp→manager) · LATERAL (right
  side references each left row — per-row subquery/top-N-per-group).
- **Anti-join**: `LEFT JOIN ... WHERE right.id IS NULL` (rows with no match).
- **Quick Q**: top-1 child per parent? → LATERAL join (or DISTINCT ON / window).

## Subqueries
- Scalar (single value), IN (set membership), **EXISTS/NOT EXISTS** (correlated,
  often faster than IN for existence), correlated (references outer row), ANY/ALL,
  derived table (subquery in FROM).
- **Quick Q**: EXISTS vs IN? → EXISTS short-circuits, handles NULLs better; IN fine
  for small static sets.

## Set operations
- UNION (distinct) vs **UNION ALL** (keeps dups, faster) · INTERSECT · EXCEPT.
  Column count/types must match.

## Aggregates & grouping
- GROUP BY + HAVING (filter groups, not rows — WHERE filters rows first).
- **FILTER (WHERE ...)** for conditional aggregates · string_agg/array_agg to
  collapse rows · **DISTINCT ON** (first row per group) · ROLLUP/CUBE/GROUPING SETS
  for subtotals · CASE for bucketing.

## Window functions
- Compute over related rows WITHOUT collapsing them. `OVER (PARTITION BY ... ORDER
  BY ...)`.
- Ranking: ROW_NUMBER (unique) / RANK (gaps on ties) / DENSE_RANK (no gaps).
- LAG/LEAD (prev/next), NTILE (buckets), FIRST/LAST_VALUE.
- Frames: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` = running total.
- **Quick Q**: top-N per group? → RANK/ROW_NUMBER partitioned, filter rn<=N.

## CTEs
- `WITH` names subqueries (readability/reuse). **WITH RECURSIVE** = base UNION ALL
  recursive step → walk trees/graphs (org charts, category trees).

## Upsert & RETURNING
- `INSERT ... ON CONFLICT (key) DO UPDATE SET ... ` (EXCLUDED = proposed row) or
  `DO NOTHING`. **RETURNING** gives affected rows back (get generated ids in one
  round-trip).

## JSONB & arrays
- `->`(json) `->>`(text) `#>>`(deep path); containment `@>`; key exists `?`;
  `jsonb_set` to update. Arrays: `@>`, `&&`, `= ANY(...)`, `unnest`. **GIN index**
  for JSONB/array/full-text. Prefer JSONB over JSON.

## Full-text search
- `to_tsvector` @@ `to_tsquery`/`plainto_tsquery`; `ts_rank` for relevance; store a
  GENERATED tsvector column + GIN index. Beats `LIKE '%x%'` (stemming, ranking).

## Transactions, isolation & locking
- ACID; BEGIN/COMMIT/ROLLBACK; SAVEPOINT for partial rollback.
- Isolation: **Read Committed** (PG default) → Repeatable Read → Serializable
  (may abort → retry). Higher = fewer anomalies, less concurrency.
- Locking: `SELECT ... FOR UPDATE` (lock rows), **`FOR UPDATE SKIP LOCKED`** (queue
  workers grab different rows without waiting). Deadlock → lock rows in consistent
  order; PG aborts one.

## Views & materialized views
- VIEW = stored query, always live, no storage. **MATERIALIZED VIEW** = stored
  result, fast reads, **stale until REFRESH** (CONCURRENTLY with a unique index).

## Functions & triggers (PL/pgSQL)
- Functions encapsulate logic; triggers auto-run on INSERT/UPDATE/DELETE
  (BEFORE/AFTER, FOR EACH ROW). Uses: updated_at, audit logs, derived columns.
  `NEW`/`OLD`/`TG_OP` inside triggers.

## Indexes & EXPLAIN
- B-tree (default, eq+range+sort), GIN (jsonb/array/FTS), partial (`WHERE`),
  composite (leftmost-prefix rule), covering (`INCLUDE` → index-only scan).
- `EXPLAIN ANALYZE`: watch for Seq Scan on big tables (missing index), estimated vs
  actual rows (stale stats → `ANALYZE`), costly Sort/Nested Loop.

## Pagination
- **OFFSET/LIMIT** — simple, but slow on deep pages + unstable under inserts.
- **Keyset/seek** — `WHERE id > :lastId ORDER BY id LIMIT n` (composite cursor for
  non-unique sort). Constant time, index-friendly → use for large/infinite lists.
