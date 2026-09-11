# Backend System Design — Architect Cheat Sheet

## Layering (NestJS)
- **Controller** (HTTP) → **Service** (business logic) → **Repository/ORM** (data).
- Cross-cutting via guards (authz), interceptors (logging/caching/transform), pipes
  (validation), filters (errors). Keep controllers thin, services testable, data
  access isolated.

## REST API design
- Resource nouns + HTTP verbs: `GET /posts`, `POST /posts`, `GET /posts/:id`,
  `PATCH /posts/:id`, `DELETE /posts/:id`.
- Status codes: 200/201/204, 400 (validation), 401 (authn), 403 (authz), 404,
  409 (conflict), 422, 429 (rate limit), 500.
- Idempotency: GET/PUT/DELETE idempotent; POST not (support idempotency keys for
  safe retries). Pagination (offset vs cursor), filtering, sorting via query params.
- Versioning: URI (`/v1`), header, or media type. Deprecate gracefully.

## Error contract
- Standard shape `{ statusCode, message, path, timestamp, code? }` via a global
  exception filter. Don't leak stack traces/internal details to clients. Map domain
  errors → HTTP codes.

## Validation & contracts
- Validate at the boundary (DTOs + class-validator, or shared **Zod** schemas FE+BE).
  Never trust client input. Whitelist + strip unknown fields.

## Caching (layers)
1. HTTP/CDN (`Cache-Control`, `ETag`).
2. App cache — **Redis** (cache-aside): read cache→miss→DB→fill; write→invalidate.
3. DB — indexes, materialized views.
- Invalidation: TTLs + event-driven (publish event on write → invalidate/refresh).
  Hard part; version keys when in doubt.

## Performance & resilience
- **N+1 queries**: batch/join/`include`; add DataLoader for GraphQL.
- **Connection pooling** (PgBouncer / ORM pool) — don't exhaust DB connections.
- **Rate limiting / throttling** (`@nestjs/throttler`) + backpressure.
- **Timeouts, retries with backoff, circuit breakers** for downstream calls.
- **Pagination** everything that can grow unbounded.
- **Bulk** operations over per-row round-trips.

## Async & event-driven (Redis + EventBridge phases)
- Offload slow work to **queues** (BullMQ/Redis): return fast, process in workers,
  retries + DLQ. Idempotent consumers (jobs can run twice).
- **Events** (EventBridge/Kafka/SNS) decouple services: publish domain events, fan
  out to consumers. Patterns: event notification, event-carried state transfer,
  **CQRS** (separate read/write models), **saga** (distributed transactions),
  outbox pattern (atomic DB write + event publish).

## Security
- AuthN (JWT/OIDC) + AuthZ (RBAC in guards) — enforce server-side.
- Secrets in env/secret manager, never in code. Parameterized queries (no SQL
  injection). Helmet headers, CORS allowlist, input validation, rate limiting.
- Least privilege DB user; encrypt in transit (TLS) + at rest.

## Observability
- **Structured logging** (JSON + correlation/request id via middleware).
- **Metrics** (Prometheus: latency, error rate, throughput — RED/USE).
- **Tracing** (OpenTelemetry) across services. **Health checks** (`@nestjs/terminus`)
  for liveness/readiness. Alerting on SLOs.

## Migrations & deploy
- Versioned migrations (Prisma migrate) in CI; `migrate deploy` on release.
- **Backward-compatible / expand-contract**: add nullable → backfill → switch reads
  → drop old — so rolling deploys don't break. Never destructive without a plan.

## Interview signals
- Thin controller / logic in services / isolated data access.
- Standard error contract + validation at the boundary.
- Cache-aside + invalidation; know the N+1 fix and pooling.
- Async via queues (idempotent, retries, DLQ); events to decouple; outbox for
  atomicity.
- Observability = logs + metrics + traces + health; expand-contract migrations.
