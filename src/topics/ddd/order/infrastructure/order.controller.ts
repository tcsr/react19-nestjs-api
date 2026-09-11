/**
 * INBOUND ADAPTER — OrderController
 * --------------------------------
 * The HTTP layer is just another adapter driving the application use case. It maps
 * the request to a command and returns the result. It knows nothing about the
 * domain internals.
 *
 * Try (server running):
 *   POST /orders  { "customerId": "c1", "lines": [{ "productId": "p1", "quantity": 2, "unitPrice": 9.99 }] }
 *   GET  /orders/:id
 */

import { Body, Controller, Get, Inject, NotFoundException, Param, Post } from '@nestjs/common';
import { PlaceOrderUseCase, type PlaceOrderCommand } from '../application/place-order.usecase.js';
import { ORDER_REPOSITORY, type OrderRepository } from '../domain/order.repository.js';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly placeOrder: PlaceOrderUseCase,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  @Post()
  place(@Body() body: PlaceOrderCommand) {
    return this.placeOrder.execute(body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const order = await this.orders.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    // Map the aggregate to a plain response DTO — don't leak domain internals.
    return {
      id: order.id,
      status: order.status,
      total: order.total().amount,
      lines: order.lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice.amount,
      })),
    };
  }
}
