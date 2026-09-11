/**
 * WORKER THREADS & PROCESS
 * ------------------------
 * Node's JS runs on one thread. CPU-heavy work (parsing, crypto, image/number
 * crunching) blocks the event loop and stalls all requests. Options to parallelize:
 *
 *  - worker_threads : real threads sharing memory (SharedArrayBuffer) — best for
 *    CPU-bound work inside one process.
 *  - cluster / child_process : separate processes (own memory) — scale across CPU
 *    cores, isolate crashes. (PM2 / Node cluster fork per core.)
 *  - Offload to a queue + worker service (BullMQ/Redis) — the production pattern
 *    for long jobs (ties to the Redis + EventBridge phases).
 *
 * Rule: keep the event loop free. Async I/O is already parallel via libuv; only
 * CPU-bound work needs threads/processes.
 *
 * process basics: process.env, process.argv, process.pid, process.exit(code),
 * signals (SIGINT/SIGTERM) for graceful shutdown.
 *
 * Run: npx tsx src/topics/node/07-worker-threads.ts
 */

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

function heavy(n: number): number {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.sqrt(i);
  return Math.round(sum);
}

if (isMainThread) {
  console.log('main pid:', process.pid);

  // Spawn a worker to run heavy() off the main thread.
  const worker = new Worker(fileURLToPath(import.meta.url), {
    workerData: 5_000_000,
  });
  worker.on('message', (result) => console.log('worker result:', result));
  worker.on('exit', (code) => console.log('worker exited:', code));

  // Main thread stays responsive meanwhile.
  console.log('main not blocked, continues immediately');
} else {
  // Worker thread context.
  const result = heavy(workerData as number);
  parentPort?.postMessage(result);
}
