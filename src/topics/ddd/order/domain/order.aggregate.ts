/**
 * AGGREGATE ROOT — Order
 * ----------------------
 * An AGGREGATE is a cluster of objects (root entity + child entities + value
 * objects) treated as ONE consistency boundary. Rules:
 *  - Outside code references only the ROOT (Order), never the children (lines).
 *  - The root enforces all INVARIANTS (business rules) and is the only entry for
 *    changes — state transitions go through its methods, not setters.
 *  - One transaction = one aggregate saved. Reference OTHER aggregates by id only.
 *
 * The root records DOMAIN EVENTS as it changes; the application layer pulls +
 * publishes them after persistence.
 */

import { randomUUID } from 'node:crypto';
import { Money } from './money.vo.js';
import { OrderStatus } from './order-status.js';
import { type DomainEvent, OrderPlaced, OrderPaid } from './events.js';

// Child ENTITY inside the aggregate (identity local to the order).
interface OrderLine {
  productId: string;
  quantity: number;
  unitPrice: Money;
}

export class Order {
  private readonly _events: DomainEvent[] = [];
  private _lines: OrderLine[] = [];
  private _status: OrderStatus = OrderStatus.DRAFT;

  private constructor(
    readonly id: string,
    readonly customerId: string,
  ) {}

  static create(customerId: string): Order {
    if (!customerId) throw new Error('customerId required');
    return new Order(randomUUID(), customerId);
  }

  // Rehydrate from persistence without re-running creation rules / events.
  static rehydrate(id: string, customerId: string, status: OrderStatus, lines: OrderLine[]): Order {
    const o = new Order(id, customerId);
    o._status = status;
    o._lines = lines;
    return o;
  }

  get status() {
    return this._status;
  }
  get lines(): ReadonlyArray<OrderLine> {
    return this._lines;
  }

  // INVARIANT: can only add lines while DRAFT; quantity/price must be valid.
  addLine(productId: string, quantity: number, unitPrice: Money) {
    if (this._status !== OrderStatus.DRAFT) throw new Error('Can only add lines to a draft order');
    if (quantity <= 0) throw new Error('Quantity must be positive');
    this._lines.push({ productId, quantity, unitPrice });
  }

  total(): Money {
    return this._lines.reduce((sum, l) => sum.add(l.unitPrice.multiply(l.quantity)), Money.zero());
  }

  // TRANSITION: DRAFT -> PLACED. Invariant: order must have at least one line.
  place() {
    if (this._status !== OrderStatus.DRAFT) throw new Error('Order already placed');
    if (this._lines.length === 0) throw new Error('Cannot place an empty order');
    this._status = OrderStatus.PLACED;
    this._events.push(new OrderPlaced(this.id, this.customerId, this.total().amount));
  }

  // TRANSITION: PLACED -> PAID.
  markPaid() {
    if (this._status !== OrderStatus.PLACED) throw new Error('Only a placed order can be paid');
    this._status = OrderStatus.PAID;
    this._events.push(new OrderPaid(this.id));
  }

  cancel() {
    if (this._status === OrderStatus.PAID) throw new Error('Cannot cancel a paid order');
    this._status = OrderStatus.CANCELLED;
  }

  // Application layer pulls events to publish after save, then clears them.
  pullEvents(): DomainEvent[] {
    const out = [...this._events];
    this._events.length = 0;
    return out;
  }
}
