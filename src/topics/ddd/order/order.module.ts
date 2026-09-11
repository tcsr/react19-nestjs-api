/**
 * OrderModule — wires the hexagonal layers via DI.
 * ------------------------------------------------
 * Binds each PORT (interface token) to a concrete ADAPTER. Swap the adapter here
 * (InMemory -> Prisma, Console -> Kafka) without touching domain/application code —
 * dependency inversion in practice. This module IS the "order" bounded context;
 * in the microservices phase it becomes its own deployable service.
 */

import { Module } from '@nestjs/common';
import { PlaceOrderUseCase } from './application/place-order.usecase.js';
import { ORDER_REPOSITORY } from './domain/order.repository.js';
import { DOMAIN_EVENT_PUBLISHER } from './domain/events.js';
import { InMemoryOrderRepository } from './infrastructure/in-memory-order.repository.js';
import { ConsoleEventPublisher } from './infrastructure/console-event-publisher.js';
import { OrderController } from './infrastructure/order.controller.js';

@Module({
  controllers: [OrderController],
  providers: [
    PlaceOrderUseCase,
    // PORT -> ADAPTER bindings (change these to swap infrastructure).
    { provide: ORDER_REPOSITORY, useClass: InMemoryOrderRepository },
    { provide: DOMAIN_EVENT_PUBLISHER, useClass: ConsoleEventPublisher },
  ],
})
export class OrderModule {}
