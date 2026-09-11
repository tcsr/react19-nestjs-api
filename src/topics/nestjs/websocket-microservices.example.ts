/**
 * WEBSOCKETS & MICROSERVICES (reference, not wired)
 * -------------------------------------------------
 *
 * WEBSOCKET GATEWAYS (@nestjs/websockets + @nestjs/platform-socket.io):
 *   npm i @nestjs/websockets @nestjs/platform-socket.io socket.io
 *   A @WebSocketGateway is like a controller for socket events. Real-time push
 *   (chat, notifications, live dashboards). Scale across instances with a Redis
 *   adapter (pub/sub backplane) so messages reach clients on other nodes.
 *
 * MICROSERVICES (@nestjs/microservices):
 *   Nest can run as a microservice over a transport: TCP, Redis, NATS, RabbitMQ,
 *   Kafka, gRPC. Two messaging styles:
 *     @MessagePattern  — request/response (RPC).
 *     @EventPattern    — fire-and-forget events (event-driven; pairs with the
 *                        EventBridge phase for decoupled fan-out).
 */

/* --- websocket gateway ---
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class ChatGateway {
  @WebSocketServer() server!: Server;

  @SubscribeMessage('message')
  onMessage(@MessageBody() text: string) {
    this.server.emit('message', text); // broadcast to all clients
  }
}
*/

/* --- microservice consumer ---
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class OrdersMsController {
  @MessagePattern({ cmd: 'sum' })          // RPC: returns a value
  sum(@Payload() nums: number[]) { return nums.reduce((a, b) => a + b, 0); }

  @EventPattern('order.placed')            // event: no response expected
  handleOrderPlaced(@Payload() data: { orderId: string }) { /* react *\/ }
}
*/

export {};
