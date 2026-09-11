# Backend Docs — Node · NestJS · PostgreSQL

Mirrors the React app's learning layout: runnable topic code (`src/topics/`),
study notes, and architect cheat-sheets.

## Study notes (def → key points → gotchas → when-to-use → quick Q)
| Notes | Code |
|---|---|
| [notes/node.md](./notes/node.md) | `src/topics/node/*.ts` (run with tsx) |
| [notes/nestjs.md](./notes/nestjs.md) | `src/topics/nestjs/` + wired `learning/` module |
| [notes/prisma.md](./notes/prisma.md) | `src/topics/prisma/`, `src/posts/`, `prisma/schema.prisma` |
| [notes/ddd.md](./notes/ddd.md) | `src/topics/ddd/order/` (hexagonal Order slice) |

## Architect cheat-sheets
| Sheet | Covers |
|---|---|
| [architecture/postgresql.md](./architecture/postgresql.md) | ACID, isolation, indexes, joins, EXPLAIN, normalization, CTEs/windows, pooling, partitioning |
| [architecture/backend-system-design.md](./architecture/backend-system-design.md) | REST design, error contracts, layering, caching, N+1, rate limiting, CQRS, migrations, observability |
| [architecture/ddd.md](./architecture/ddd.md) | DDD: bounded contexts, aggregates, value objects, domain events, hexagonal, context mapping, DDD→microservices |

## Running the topic code
```bash
# Node standalone scripts (executable):
npx tsx src/topics/node/01-event-loop.ts
npx tsx src/topics/node/03-async-patterns.ts   # etc.

# NestJS lifecycle demo (server must be running):
npm run start:dev
#   GET  http://localhost:3000/learning/ping  -H "x-api-key: secret"
```

`*.example.ts` files are commented references (auth, caching, queues, gateways,
microservices, DI/scopes, swagger) — excluded from the build, no extra deps.

## Relation to the frontend
This API is the backend for `react19-topics`. Point that app's
`src/lib/api.ts` BASE_URL at `http://localhost:3000` and its React Query demos
run against real Postgres data. Later phases add Redis cache + EventBridge async.
