/**
 * REPOSITORY PORT (hexagonal architecture)
 * ----------------------------------------
 * The repository is a PORT: an interface OWNED BY THE DOMAIN that describes how to
 * persist/retrieve an aggregate — in domain terms, hiding the storage tech. The
 * concrete ADAPTER (Prisma, in-memory, Mongo) lives in the infrastructure layer
 * and is injected. This keeps the domain pure (no DB imports) and swappable/testable
 * — the essence of ports & adapters / dependency inversion.
 *
 * One repository PER AGGREGATE, dealing in whole aggregates.
 */

import { Order } from './order.aggregate.js';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

// DI token (interfaces don't exist at runtime, so we inject by token).
export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
