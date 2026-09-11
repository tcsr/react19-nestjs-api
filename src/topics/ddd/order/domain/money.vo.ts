/**
 * VALUE OBJECT — Money
 * --------------------
 * A value object has NO identity: it is defined entirely by its attributes, is
 * IMMUTABLE, and compares by value (two Money{10,USD} are equal). Contrast with an
 * ENTITY, which has an id and a lifecycle. Value objects also guard their own
 * invariants (no negative amount, same currency to add).
 */

export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: string,
  ) {
    Object.freeze(this); // immutable
  }

  static of(amount: number, currency = 'USD'): Money {
    if (amount < 0) throw new Error('Money cannot be negative');
    if (!Number.isFinite(amount)) throw new Error('Money must be finite');
    return new Money(Math.round(amount * 100) / 100, currency);
  }

  static zero(currency = 'USD'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
