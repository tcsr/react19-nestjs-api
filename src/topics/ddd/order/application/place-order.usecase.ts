/**
 * APPLICATION SERVICE / USE CASE — PlaceOrder
 * -------------------------------------------
 * The application layer ORCHESTRATES a use case: load/create aggregates, invoke
 * their domain methods, persist via the repository PORT, then publish domain
 * events. It contains NO business rules itself (those live in the aggregate) — only
 * coordination + transaction boundary. Depends on PORTS (interfaces), never on
 * infrastructure directly.
 */

import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../domain/order.aggregate.js';
import { Money } from '../domain/money.vo.js';
import { ORDER_REPOSITORY, type OrderRepository } from '../domain/order.repository.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../domain/events.js';

export interface PlaceOrderCommand {
  customerId: string;
  lines: { productId: string; quantity: number; unitPrice: number }[];
}

@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(cmd: PlaceOrderCommand): Promise<{ id: string; total: number }> {
    // Build the aggregate through its own API (rules enforced inside).
    const order = Order.create(cmd.customerId);
    for (const l of cmd.lines) {
      order.addLine(l.productId, l.quantity, Money.of(l.unitPrice));
    }
    order.place(); // domain invariant + records OrderPlaced

    await this.orders.save(order); // persist via port
    await this.events.publishAll(order.pullEvents()); // publish after save

    return { id: order.id, total: order.total().amount };
  }
}
