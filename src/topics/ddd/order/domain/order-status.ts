/**
 * OrderStatus — a small value object modeling the order lifecycle as an explicit
 * state, with the ubiquitous-language terms the domain experts use.
 * Allowed transitions are enforced by the Order aggregate, not here.
 */

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}
