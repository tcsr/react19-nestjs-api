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

## HTTP module
- Built-in `http.createServer((req,res)=>...)`. req=Readable, res=Writable; must
  `res.end()`. Manual method+url routing → what Express/Nest automate. Frameworks
  add routing, DI, validation, middleware on top of this.

## Crypto (node:crypto)
- **Hash** (SHA-256) for integrity — NOT passwords. **Passwords**: slow KDF
  (scrypt/bcrypt/argon2) + per-user salt. **HMAC** keyed signatures (webhooks).
  **AES-256-GCM** authenticated symmetric encryption (random IV + auth tag).
  **randomBytes/randomUUID** for secure tokens/ids. Compare secrets with
  `timingSafeEqual` (avoid timing attacks).
- **Quick Q**: hash a password with SHA-256? → No — use scrypt/bcrypt/argon2 + salt.

## fs & path
- Prefer `fs/promises` + async/await (sync blocks the loop). Stream large files.
  `path.join`/`extname`/`basename` for cross-platform paths (never concat with '/').
  `mkdir(dir,{recursive:true})` = mkdir -p.

## child_process
- `spawn` (stream, long/large output) · `exec` (buffered string) · `fork` (Node
  child + IPC). Shell out / run CLIs / scale across cores.

## Concurrency / scaling
- Async I/O already parallel (libuv). CPU-bound work → **worker_threads** (shared
  memory) or **cluster/child_process** (separate memory, per-core). Long jobs →
  **queue + worker** (BullMQ/Redis). Rule: keep the event loop free.
- **process**: env, argv, pid, signals (SIGTERM/SIGINT) for graceful shutdown.
- **Quick Q**: fix a slow endpoint doing heavy CPU? → Offload to worker thread or a
  queue; don't block the loop.
