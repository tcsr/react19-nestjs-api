/**
 * ADAPTER — in-memory OrderRepository
 * -----------------------------------
 * Concrete implementation of the OrderRepository PORT. Lives in infrastructure.
 * In-memory here so the demo runs with no DB. A Prisma adapter would map the Order
 * aggregate <-> DB rows (see the commented sketch) and be swapped in the module —
 * the domain + application layers don't change (dependency inversion).
 */

import { Injectable } from '@nestjs/common';
import type { OrderRepository } from '../domain/order.repository.js';
import { Order } from '../domain/order.aggregate.js';

@Injectable()
export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }
}

/* --- Prisma adapter sketch (same port, real DB) ---
@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaService) {}
  async save(order: Order) {
    // map aggregate -> rows (order + lines) in one transaction
    await this.prisma.$transaction(async (tx) => { ... });
  }
  async findById(id: string) {
    const row = await this.prisma.order.findUnique({ where: { id }, include: { lines: true } });
    return row ? Order.rehydrate(row.id, row.customerId, row.status, mapLines(row.lines)) : null;
  }
}
*/
