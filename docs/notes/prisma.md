# Prisma + PostgreSQL (data access) — Study Notes

Code: `src/topics/prisma/queries.example.ts`, `src/posts/posts.service.ts`,
`prisma/schema.prisma`

## What Prisma is
- Type-safe ORM/query builder. `schema.prisma` = single source of truth →
  generates a typed client + migrations. (Chosen over TypeORM for DX + type safety.)

## Schema
- `datasource` (provider + url), `generator` (client output), `model` blocks.
- Field attributes: `@id`, `@default(autoincrement())`, `@unique`, `@map` (column
  name), `@@map` (table name), `@relation`, `@updatedAt`.
- Prisma 7 note: new `prisma-client` generator outputs to `src/generated/prisma`;
  config in `prisma7.config.ts`; url from env via that config; needs `dotenv`.

## Client queries
- CRUD: `create`, `findUnique`, `findMany`, `update`, `delete`, `upsert`.
- Filter operators: `contains/gte/lte/in/OR/AND/NOT`.
- Select vs include: `select` shapes output; `include` pulls relations.
- **Pagination**: offset (`skip`/`take`) — simple; **cursor** (`cursor`+`take`) —
  stable for large/infinite lists.
- Aggregation: `aggregate`, `groupBy`, `count`.

## Transactions
- Array form `$transaction([...])` = all-or-nothing batch.
- Interactive `$transaction(async tx => {...})` = logic between queries, atomic.

## Migrations
- `prisma migrate dev --name x` (dev: create + apply + regen client).
- `prisma migrate deploy` (prod: apply pending only).
- `prisma db seed` (seed script). `prisma studio` (GUI). `prisma generate` (client).

## Gotchas
- Regenerate client after schema change (`postinstall` runs it here).
- **N+1**: fetching relations in a loop → use `include`/`select` or batch.
- Connection pool: one `PrismaClient` per app (shared, pooled) — this app uses a
  global `PrismaService`.
- Raw queries are parameterized (`$queryRaw` tagged template) — don't string-concat
  user input.

## Quick Q
- schema.prisma role? → Source of truth → client + migrations.
- Offset vs cursor pagination? → simple skip/take vs stable cursor for big lists.
- Avoid N+1 in Prisma? → include/select, batch, avoid per-row queries.
- migrate dev vs deploy? → dev creates+applies+regens; deploy only applies pending.
