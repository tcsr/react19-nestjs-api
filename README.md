# react19-nestjs-api

Backend for [react19-topics](https://github.com/tcsr/react19-topics): **NestJS +
Prisma + PostgreSQL**. Doubles as a **learning source of truth** for Node, NestJS,
and PostgreSQL — same three-layer approach as the React app (runnable topic code +
study notes + architect cheat-sheets).

## Stack
NestJS 12 (ESM/NodeNext) · Prisma 7 · PostgreSQL · class-validator · Vitest.

## Setup
```bash
npm install                         # also runs prisma generate (postinstall)
cp .env.example .env                # then edit DATABASE_URL for your local Postgres
npx prisma migrate dev --name init  # create schema
npx prisma db seed                  # 25 sample posts
npm run start:dev                   # http://localhost:3000
```

## App (feature slice)
Posts CRUD over Postgres, matching the frontend `api.ts` contract so React Query
works once its BASE_URL points here.

| Method | Route | |
|---|---|---|
| GET | `/posts?_page&_limit` | paginated list |
| GET | `/posts/:id` | one |
| POST | `/posts` | create (validated) |
| PATCH | `/posts/:id` | update |
| DELETE | `/posts/:id` | delete |

Structure: `src/prisma` (global client), `src/posts` (controller/service/DTOs),
`main.ts` (CORS + global ValidationPipe), `prisma/schema.prisma` (Post model).

## Learning materials
- **Runnable topics** — `src/topics/`
  - `node/` — event loop, modules, async, EventEmitter, streams, errors, worker
    threads, **HTTP server, crypto, fs/path, child_process** (run:
    `npx tsx src/topics/node/01-event-loop.ts`).
  - `nestjs/learning/` — **wired** module demoing the full request lifecycle
    (middleware → guard → interceptor → pipe → handler → filter) on `/learning/*`.
  - `nestjs/features/` — **wired**: serialization (`/features/user`), file upload
    (`/features/upload`), health (`/health`), API versioning (`/v1|/v2`).
  - `nestjs/graphql/` — **wired** code-first GraphQL at `/graphql`.
  - `nestjs/*.example.ts` — commented references: auth (JWT/RBAC), caching,
    queues/scheduling, websockets/microservices, DI/scopes/dynamic modules,
    swagger/config/lifecycle, logging/global-binding.
  - `prisma/` — query + **relations** patterns; `sql/practice.sql` — runnable SQL
    (DDL/DML, joins, indexes, CTEs, windows, transactions, EXPLAIN).
  - `ddd/order/` — **wired DDD** slice in hexagonal layers: Order aggregate, Money
    value object, repository port + in-memory adapter, domain events. Live at
    `/orders` (POST places an order → emits OrderPlaced). One bounded context =
    one future microservice.
- **Tests** — `src/posts/posts.service.spec.ts` (unit, mocked Prisma),
  `test/posts.e2e-spec.ts` (e2e). `npm test` / `npm run test:e2e`.
- **Study notes** — [`docs/notes/`](docs/README.md) (Node, NestJS, Prisma).
- **Architect cheat-sheets** — [`docs/architecture/`](docs/README.md) (PostgreSQL
  deep, backend system design).

Try the lifecycle demo (server running):
```bash
curl http://localhost:3000/learning/ping                       # 401 (guard)
curl http://localhost:3000/learning/ping -H "x-api-key: secret"
```

## Roadmap
1. ✅ NestJS + PostgreSQL (this repo)
2. Redis cache — cache-aside over Postgres
3. Async / EventBridge — event-driven background processing
4. Wire frontend React Query BASE_URL → this API
