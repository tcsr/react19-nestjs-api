/**
 * JobsModule — BullMQ queue wiring (Redis-backed).
 * BullModule.forRoot sets the Redis connection; registerQueue declares the queue.
 * Exports NotificationsService so other modules can enqueue jobs.
 */

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { Redis } from 'ioredis';
import { NotificationsProcessor, NOTIFICATIONS_QUEUE } from './notifications.processor.js';
import { NotificationsService } from './notifications.service.js';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      // Under native ESM, BullMQ can't lazy-load ioredis — pass a constructed
      // client. maxRetriesPerRequest:null is required by BullMQ blocking commands.
      useFactory: () => ({
        connection: new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
          maxRetriesPerRequest: null,
        }),
      }),
    }),
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
  ],
  providers: [NotificationsProcessor, NotificationsService],
  exports: [NotificationsService],
})
export class JobsModule {}
