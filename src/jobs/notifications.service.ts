/**
 * BULLMQ PRODUCER
 * ---------------
 * Adds jobs to the 'notifications' queue and returns immediately — the request
 * doesn't wait for the work. Job options demonstrate resilience knobs: retries with
 * exponential backoff, and removeOnComplete to keep Redis tidy.
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { NOTIFICATIONS_QUEUE } from './notifications.processor.js';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue) {}

  async postCreated(postId: number) {
    await this.queue.add(
      'post-created',
      { postId },
      {
        attempts: 3, // retry up to 3 times on failure
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100, // keep last 100 completed jobs
        removeOnFail: 500,
      },
    );
  }
}
