/**
 * DOMAIN EVENTS
 * -------------
 * A domain event records something meaningful that happened in the domain, named
 * in past tense with ubiquitous language (OrderPlaced, OrderPaid). Aggregates
 * RECORD events as they change state; the application layer PUBLISHES them after
 * the aggregate is persisted. Other parts of the system (or other bounded contexts
 * / microservices) react — this is the seam that becomes Kafka events later.
 */

export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}

export class OrderPlaced implements DomainEvent {
  readonly type = 'order.placed';
  readonly occurredAt = new Date();
  constructor(
    readonly orderId: string,
    readonly customerId: string,
    readonly total: number,
  ) {}
}

export class OrderPaid implements DomainEvent {
  readonly type = 'order.paid';
  readonly occurredAt = new Date();
  constructor(readonly orderId: string) {}
}

// PORT: how the application publishes domain events (adapter provided by infra).
export interface DomainEventPublisher {
  publishAll(events: DomainEvent[]): Promise<void>;
}
export const DOMAIN_EVENT_PUBLISHER = Symbol('DOMAIN_EVENT_PUBLISHER');
