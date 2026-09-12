# Async Jobs & Queues (BullMQ) — Study Notes

Code: `src/jobs/` (module, producer, processor) · wired in `PostsService.create`

## Why a queue
- Move slow / unreliable / bursty work OUT of the request path so the API responds
  fast: emails, PDFs/thumbnails, third-party calls, indexing, aggregation.
- **Producer** adds a job and returns immediately; a **worker** (consumer) processes
  it later. Decouples timing + load; smooths spikes (buffering).

## BullMQ (Redis-backed)
- Jobs live in Redis lists/sorted-sets. `Queue.add(name, data, opts)` enqueues;
  `@Processor` + `WorkerHost.process(job)` consumes.
- **Options** (resilience knobs): `attempts` + `backoff` (exponential) for retries,
  `delay` for scheduled jobs, `priority`, `repeat` (cron), `removeOnComplete/Fail`
  to bound Redis growth, `concurrency` per worker.
- **States**: waiting → active → completed | failed (after final attempt). The
  **failed** set is a DLQ-like store you inspect/replay.

## Must-knows
- **Idempotent handlers** — a job may run more than once (retry after a crash);
  processing twice must equal once (dedup by a business key).
- **Workers scale horizontally** — run more worker processes/replicas to increase
  throughput (each pulls from the same queue). Often a SEPARATE deployment from the
  API so they scale independently.
- **Failure handling** — retries with backoff for transient errors; after attempts
  exhausted, leave in failed/DLQ + alert. Don't retry non-idempotent work blindly.
- **Ordering** — queues are roughly FIFO but concurrency + retries break strict
  order; don't rely on it (use a key/lock if order matters).

## BullMQ vs Kafka (when to use which)
| | BullMQ (queue) | Kafka (log) |
|---|---|---|
| Model | task queue, ack-and-remove | durable replayable log |
| Best for | background jobs, retries, delays, cron | event streaming, fan-out, audit, replay |
| Retention/replay | no (done = gone) | yes |
| In this project | backend async jobs | cross-service events (microservices) |

## ESM gotcha (hit here)
- Under native ESM, BullMQ can't lazy-load ioredis — pass a **constructed** client:
  `new Redis(url, { maxRetriesPerRequest: null })`.

## Scheduling
- `@nestjs/schedule` (`@Cron/@Interval/@Timeout`) for in-process periodic tasks;
  BullMQ `repeat` for distributed/persisted schedules.

## Quick Q
- Why offload to a queue? → return fast; do slow/bursty work async with retries.
- Why idempotent workers? → jobs can retry / run twice.
- Scale throughput? → more worker processes on the same queue.
- BullMQ vs Kafka? → task queue (ack+remove) vs replayable event log.
