/**
 * EVENTEMITTER
 * ------------
 * Node's built-in publish/subscribe primitive. Objects emit named events; any
 * number of listeners react. Foundation of streams, HTTP servers, sockets — and
 * the mental model behind message-driven systems (Redis pub/sub, EventBridge).
 *
 *  emitter.on(event, listener)    — subscribe
 *  emitter.once(event, listener)  — subscribe for a single fire
 *  emitter.emit(event, ...args)   — publish (synchronous: listeners run in order)
 *  emitter.off(event, listener)   — unsubscribe
 *
 * Notes: listeners run SYNCHRONOUSLY in registration order. An 'error' event with
 * no listener throws. Default max 10 listeners per event (tune with
 * setMaxListeners) — a leak warning otherwise.
 *
 * Run: npx tsx src/topics/node/04-event-emitter.ts
 */

import { EventEmitter } from 'node:events';

interface OrderEvents {
  placed: [orderId: string, amount: number];
  shipped: [orderId: string];
}

// Typed emitter (Node 20+ generics).
class OrderBus extends EventEmitter<OrderEvents> {}

const bus = new OrderBus();

bus.on('placed', (id, amount) => console.log(`order ${id} placed: $${amount}`));
bus.once('shipped', (id) => console.log(`order ${id} shipped (once)`));

bus.emit('placed', 'A1', 99);
bus.emit('shipped', 'A1');
bus.emit('shipped', 'A1'); // ignored: 'once' already consumed

console.log('placed listeners:', bus.listenerCount('placed'));
