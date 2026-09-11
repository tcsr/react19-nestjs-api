/**
 * DOMAIN UNIT TEST — Order aggregate.
 * Pure domain logic: no DB, no Nest, no mocks. This purity is a key DDD benefit —
 * business rules are fast + trivial to test in isolation.
 * Run: npm test
 */

import { describe, it, expect } from 'vitest';
import { Order } from './order.aggregate.js';
import { Money } from './money.vo.js';
import { OrderStatus } from './order-status.js';

describe('Order aggregate', () => {
  it('computes total from lines', () => {
    const order = Order.create('c1');
    order.addLine('p1', 2, Money.of(10)); // 20
    order.addLine('p2', 1, Money.of(5.5)); // 5.5
    expect(order.total().amount).toBe(25.5);
  });

  it('cannot place an empty order (invariant)', () => {
    const order = Order.create('c1');
    expect(() => order.place()).toThrow('Cannot place an empty order');
  });

  it('place() transitions to PLACED and records a domain event', () => {
    const order = Order.create('c1');
    order.addLine('p1', 1, Money.of(9.99));
    order.place();

    expect(order.status).toBe(OrderStatus.PLACED);
    const events = order.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('order.placed');
    expect(order.pullEvents()).toHaveLength(0); // pulled once, then cleared
  });

  it('cannot add lines after placing (invariant)', () => {
    const order = Order.create('c1');
    order.addLine('p1', 1, Money.of(1));
    order.place();
    expect(() => order.addLine('p2', 1, Money.of(1))).toThrow('draft');
  });

  it('Money value object is immutable and value-equal', () => {
    const a = Money.of(10);
    const b = Money.of(10);
    expect(a.equals(b)).toBe(true); // equal by value, not reference
    expect(a.add(Money.of(5)).amount).toBe(15);
    expect(a.amount).toBe(10); // original unchanged (immutable)
  });
});
