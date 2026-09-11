/**
 * NODE EVENT LOOP
 * ---------------
 * Node is single-threaded for JS but non-blocking: the event loop offloads I/O to
 * the OS/libuv thread pool and runs callbacks when work completes. The loop runs
 * in phases, each with its own callback queue:
 *   timers      -> setTimeout / setInterval callbacks
 *   pending     -> some system callbacks
 *   poll        -> retrieve new I/O events; execute I/O callbacks
 *   check       -> setImmediate callbacks
 *   close       -> close event callbacks (e.g. socket.on('close'))
 *
 * Between EVERY phase (and after each macrotask) Node drains the MICROTASK queues:
 *   1. process.nextTick queue  (highest priority)
 *   2. Promise microtask queue
 *
 * Ordering rules to remember:
 *  - Microtasks (nextTick > promises) run before the loop continues to next phase.
 *  - setTimeout(0) is a "timers" macrotask; setImmediate is a "check" macrotask.
 *  - Inside an I/O callback, setImmediate fires before setTimeout(0).
 *
 * Run: npx tsx src/topics/node/01-event-loop.ts
 */

console.log('1: sync start');

setTimeout(() => console.log('5: setTimeout(0) [timers phase]'), 0);
setImmediate(() => console.log('6: setImmediate [check phase]'));

Promise.resolve().then(() => console.log('4: promise microtask'));
process.nextTick(() => console.log('3: process.nextTick (before promises)'));

console.log('2: sync end');

/*
 * GUARANTEED: both microtasks (nextTick + promise) run before the macrotasks
 * (setTimeout/setImmediate). So 1,2 (sync) → 3,4 (microtasks) → 5,6 (macrotasks).
 *
 * nextTick-vs-promise ordering caveat:
 *   In a plain CommonJS entry, process.nextTick ALWAYS runs before promise
 *   callbacks (nextTick queue has higher priority). But under the ESM/tsx loader
 *   the module body itself executes inside a promise job, so here you may see the
 *   promise callback print BEFORE nextTick. The reliable rule to remember is
 *   microtasks-before-macrotasks; the nextTick>promise nuance only holds outside
 *   an existing microtask context.
 *
 * timers vs check (5 vs 6) can vary in the main module; inside an I/O callback
 * setImmediate (check) always beats setTimeout(0) (timers).
 */
