/**
 * ADAPTER — console DomainEventPublisher
 * --------------------------------------
 * Implements the DomainEventPublisher PORT by logging. In the microservices phase
 * this adapter is swapped for a Kafka producer (publish each domain event to a
 * topic) — the application layer is unchanged. Real systems use the OUTBOX pattern:
 * persist events in the same DB transaction as the aggregate, then relay to the
 * broker, guaranteeing atomicity between state change and event publish.
 */

import { Injectable, Logger } from '@nestjs/common';
import type { DomainEvent, DomainEventPublisher } from '../domain/events.js';

@Injectable()
export class ConsoleEventPublisher implements DomainEventPublisher {
  private readonly logger = new Logger('DomainEvents');

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const e of events) {
      this.logger.log(`${e.type} @ ${e.occurredAt.toISOString()} ${JSON.stringify(e)}`);
    }
  }
}
