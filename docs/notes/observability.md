# Observability — Study Notes

Code: `src/observability/` · Infra: `docker compose up -d prometheus grafana`

## The three pillars
- **Metrics** (aggregate numbers over time) — Prometheus + Grafana. Wired here:
  `GET /metrics` (prom-client) exposes the **RED** signals — Rate + Errors
  (`http_requests_total{method,route,status}`) and Duration
  (`http_request_duration_seconds`) — plus Node defaults (event-loop lag, memory, GC).
  Label by the **route pattern** (`/posts/:id`) not the raw URL to bound cardinality.
- **Logs** (discrete events) — structured JSON + a **correlation/request id** on every
  line (see `RequestIdMiddleware` + `LoggingInterceptor`); ship to ELK/Loki.
- **Traces** (one request across operations/services) — **OpenTelemetry**
  (`src/observability/tracing.ts`, `OTEL_ENABLED=1`): auto-instruments HTTP/Prisma/
  Redis into spans tied by a trace id, propagated across services via the W3C
  `traceparent` header. Export via OTLP to Jaeger/Tempo (console exporter here).

## How they fit
- Metrics tell you **something is wrong** (error rate up, p99 latency up) and alert.
- Traces tell you **where** (which service/DB call is slow) — the flame graph.
- Logs tell you **why** (the exact error), filtered by correlation id.

## Prometheus / Grafana
- Prometheus **pulls** `/metrics` on an interval (`prometheus.yml`). PromQL queries;
  Grafana dashboards + alerts. Key SLO signals: request rate, error ratio, latency
  percentiles; for queues, **consumer lag**; for resources, **USE** (Utilization,
  Saturation, Errors).

## Interview signals
- RED (services) + USE (resources) + consumer lag (queues) are the metrics to watch.
- Bound metric label cardinality (route patterns, not raw URLs / ids).
- One correlation id threads logs + traces across services (propagate it everywhere).
- Metrics alert → traces localize → logs explain.
