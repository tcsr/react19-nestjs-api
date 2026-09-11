# Node.js — Study Notes

Code: `src/topics/node/*.ts` (run: `npx tsx src/topics/node/<file>.ts`)

## Event loop
- **Def**: single JS thread + non-blocking I/O; libuv offloads I/O, event loop runs
  callbacks in phases.
- **Phases**: timers → pending → poll → check → close. Microtasks drain between
  phases: **nextTick > promises**.
- **Key**: `setTimeout(0)`=timers, `setImmediate`=check; inside an I/O callback
  setImmediate fires before setTimeout(0). Microtasks always beat next phase.
- **Gotcha**: long sync/CPU work blocks the loop → all requests stall.
- **Quick Q**: nextTick vs Promise? → nextTick queue runs first, before promise
  microtasks.

## Modules (CJS vs ESM)
- **CJS**: `require`/`module.exports`, sync, `__dirname` available, conditional
  require.
- **ESM** (this project): `import`/`export`, static + hoisted, top-level await,
  tree-shakeable; relative imports need `.js` extension (NodeNext); derive dirname
  from `import.meta.url`.
- **Interop**: ESM→CJS default import ok; CJS→ESM needs dynamic `import()`.
- **Quick Q**: why `.js` on TS imports? → NodeNext resolves the emitted JS path.

## Async
- Callbacks → Promises → async/await (sugar over promises).
- **Combinators**: `all` (fail-fast), `allSettled` (never rejects), `race` (first
  settled), `any` (first fulfilled).
- **Gotcha**: sequential awaits are slow — parallelize independent work with
  `Promise.all`. Unawaited rejection → unhandledRejection.
- **Quick Q**: all vs allSettled? → all short-circuits on first reject; allSettled
  waits for every result.

## EventEmitter
- Pub/sub primitive; `on`/`once`/`emit`/`off`. Listeners run **synchronously** in
  order. Missing `error` listener throws. Basis of streams/sockets and the mental
  model for Redis pub/sub + EventBridge.

## Streams & Buffers
- **Buffer**: raw binary bytes (Uint8Array).
- **Streams**: process data in chunks (Readable/Writable/Duplex/Transform) — low
  memory for large data. **Backpressure** handled by `pipe`/`pipeline`; prefer
  `pipeline` (errors + cleanup).
- **Quick Q**: why streams? → Constant memory vs loading whole payload.

## Error handling
- try/catch (sync + await), error-first callbacks, custom Error classes, ES2022
  `cause` to wrap. Last-resort `uncaughtException`/`unhandledRejection` → log +
  exit; don't keep running in unknown state.

## Concurrency / scaling
- Async I/O already parallel (libuv). CPU-bound work → **worker_threads** (shared
  memory) or **cluster/child_process** (separate memory, per-core). Long jobs →
  **queue + worker** (BullMQ/Redis). Rule: keep the event loop free.
- **process**: env, argv, pid, signals (SIGTERM/SIGINT) for graceful shutdown.
- **Quick Q**: fix a slow endpoint doing heavy CPU? → Offload to worker thread or a
  queue; don't block the loop.
