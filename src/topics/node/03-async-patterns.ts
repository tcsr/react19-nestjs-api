/**
 * ASYNCHRONOUS PROGRAMMING
 * ------------------------
 * Three generations of async in JS/Node:
 *  1. CALLBACKS      — fn(err, result). Leads to "callback hell" when nested.
 *  2. PROMISES       — objects representing a future value; .then/.catch chain.
 *  3. ASYNC/AWAIT    — syntax sugar over promises; write async code like sync.
 *
 * Concurrency helpers:
 *  - Promise.all      : wait for ALL; rejects fast on first failure.
 *  - Promise.allSettled: wait for all; never rejects (per-item status).
 *  - Promise.race     : first to settle (resolve OR reject) wins.
 *  - Promise.any      : first to RESOLVE wins; rejects only if all reject.
 *
 * Run: npx tsx src/topics/node/03-async-patterns.ts
 */

// 1. Callback style
function loadCb(ms: number, cb: (err: Error | null, val?: number) => void) {
  setTimeout(() => cb(null, ms), ms);
}

// 2. Promisified
function load(ms: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}

async function main() {
  // callback
  loadCb(50, (_e, v) => console.log('callback done:', v));

  // await sequential (slow: 50 + 30 = 80ms)
  const a = await load(50);
  const b = await load(30);
  console.log('sequential:', a, b);

  // parallel with Promise.all (fast: ~max = 50ms)
  const [c, d] = await Promise.all([load(50), load(30)]);
  console.log('parallel:', c, d);

  // allSettled — collect successes + failures without short-circuit
  const results = await Promise.allSettled([load(10), Promise.reject(new Error('boom'))]);
  console.log('allSettled:', results.map((r) => r.status));

  // race — first to settle
  console.log('race:', await Promise.race([load(20), load(5)])); // 5
}

await main();
