# Caching & Redis — Study Notes

Code: `src/cache/cache.config.ts`, cache-aside in `src/posts/posts.service.ts` ·
Deep: `docs/architecture/backend-system-design.md`

## Why cache
- Cut load + latency by serving hot data from memory instead of the DB/an expensive
  computation. Redis = in-memory key-value store, **shared** across app instances
  (an in-process cache would be inconsistent behind a load balancer).

## Cache-aside (lazy loading) — the pattern used here
```
read : cache.get(key) -> HIT? return : MISS? load DB -> cache.set(key, val, ttl) -> return
write: update DB -> cache.del(key)      # invalidate (or re-set)
```
- App owns the caching logic. Only requested data is cached. On a miss you pay one
  DB read + populate. `PostsService.findOne` does exactly this; `update/remove/
  restore` call `invalidate(id)`.

## Other strategies (know the trade-offs)
- **Read-through / write-through** — the cache layer loads/writes the DB itself
  (consistent, more infra). **Write-behind** — write cache now, DB async (fast, risk
  of loss). **Write-around** — write DB only, cache fills on read (avoids caching
  write-only data).

## Invalidation — "the hard problem"
- **TTL** (expiry) — simplest; bounded staleness. **Explicit** on write (del/update)
  — fresh but you must find every write path. **Event-driven** — publish a change
  event; consumers invalidate (ties to Kafka/EventBridge). **Versioned keys** when
  in doubt.
- **Stampede / thundering herd**: many misses hit the DB at once when a hot key
  expires → use a short lock / request-coalescing / jittered TTLs.

## Cache layers (whole stack)
1. Browser / CDN (Cache-Control, ETag)
2. **App cache — Redis (this)**
3. DB (indexes, materialized views)

## Redis beyond caching
- Session store, rate-limit counters, **pub/sub**, **queues** (BullMQ — see
  queues-bullmq.md), leaderboards (sorted sets), distributed locks.
- Eviction policies (LRU/LFU) when memory is full; persistence (RDB/AOF) optional.

## Gotchas
- Cache the **right** things (hot, read-heavy, tolerant of slight staleness) — not
  everything.
- Every write path must invalidate, or you serve stale data.
- Bound key cardinality + set TTLs so Redis memory doesn't grow unbounded.
- Serialize consistently (JSON); beware caching soft-deleted/derived state.

## Quick Q
- Cache-aside flow? → get→miss→DB→set; write→invalidate.
- Why Redis over in-memory Map? → shared + consistent across instances.
- Hardest part of caching? → invalidation (TTL vs explicit vs event-driven).
- Stampede fix? → lock/coalesce + jittered TTL.
