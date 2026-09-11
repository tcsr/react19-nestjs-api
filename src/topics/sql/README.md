# PostgreSQL Query Suite

Runnable, self-contained `.sql` files. Each creates its own `demo_*` tables and
drops them at the end, so run in any order against a scratch database.

## Run
```bash
# psql:
psql "$DATABASE_URL" -f src/topics/sql/01-joins.sql
# or via Prisma (uses prisma7.config.ts DATABASE_URL):
npx prisma db execute --file src/topics/sql/01-joins.sql --schema prisma/schema.prisma
# or paste into pgAdmin's query tool.
```

## Files
| # | Topic |
|---|---|
| practice.sql | quick end-to-end tour |
| 01 | joins — inner/left/right/full/cross/self/lateral, anti-join |
| 02 | subqueries — scalar, IN, EXISTS, correlated, ANY/ALL, derived table |
| 03 | set operations — UNION/UNION ALL/INTERSECT/EXCEPT |
| 04 | aggregates & grouping — FILTER, DISTINCT ON, string_agg, ROLLUP/CUBE, CASE |
| 05 | window functions — ROW_NUMBER/RANK/DENSE_RANK/LAG/LEAD/NTILE, frames, running totals |
| 06 | CTEs & recursive CTEs — hierarchies |
| 07 | upsert & RETURNING — INSERT ... ON CONFLICT |
| 08 | JSONB & arrays — operators, jsonb_set, GIN indexes |
| 09 | full-text search — tsvector/tsquery, ranking, generated column + GIN |
| 10 | transactions, isolation & locking — FOR UPDATE, SKIP LOCKED, savepoints, deadlocks |
| 11 | views & materialized views — REFRESH, staleness |
| 12 | functions & triggers — PL/pgSQL, audit, updated_at |
| 13 | indexes & EXPLAIN — b-tree/composite/partial/covering, reading plans |
| 14 | pagination — offset vs keyset/cursor |

Notes: `docs/notes/sql.md`. Deep concepts: `docs/architecture/postgresql.md`.

> Needs a live Postgres + valid `DATABASE_URL`. The queries are standard SQL; run
> them against a disposable/scratch DB.
