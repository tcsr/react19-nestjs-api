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

## Relations (schema models: User/Profile/Post/Comment/Category)
- **1-1**: FK + `@unique` on the owning side (Profile.userId). **1-many**: FK on the
  many side (Post.userId) + back-relation array (User.posts). **many-many**: relation
  arrays both sides; Prisma manages the implicit join table (Post↔Category).
- Read: `include` (full relation) / `select` (specific fields) / `_count`.
- Filter by relation: `where: { author: {...}, categories: { some: {...} } }`.
- Write graphs: nested `create` / `connect` / `disconnect` / `set` in one call.
- `onDelete: Cascade` for dependent children. Index FKs (`@@index([userId])`).
- See `src/topics/prisma/relations.example.ts`.

## Prisma 7 specifics
- Requires a **driver adapter**: `new PrismaClient({ adapter: new PrismaPg({
  connectionString }) })` — plain `new PrismaClient()` throws. (See PrismaService.)
- New `prisma-client` generator → `src/generated/prisma`; config in
  `prisma7.config.ts`; needs `dotenv`.

## Raw SQL practice
- `src/topics/sql/practice.sql` — DDL/DML, constraints, joins, indexes, CTEs,
  window fns, transactions, EXPLAIN. Run via psql/pgAdmin or `prisma db execute`.

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
