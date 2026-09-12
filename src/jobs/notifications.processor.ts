/**
 * BULLMQ PROCESSOR (the WORKER)
 * ----------------------------
 * Consumes jobs from the 'notifications' queue and does the slow work OUT of the
 * request path. Runs in the same process here; in production workers are often
 * SEPARATE processes/containers that scale independently of the API.
 *
 * Throwing from process() marks the job failed → BullMQ retries it per the job's
 * attempts/backoff. After the final attempt it lands in the FAILED set (a DLQ-like
 * store you can inspect/replay). Handlers should be IDEMPOTENT (a job may retry).
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

export const NOTIFICATIONS_QUEUE = 'notifications';

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger('NotificationsWorker');

  async process(job: Job): Promise<{ done: true }> {
    this.logger.log(`processing job ${job.id} (${job.name}) attempt ${job.attemptsMade + 1}`);

    if (job.name === 'post-created') {
      // Simulate slow work (send email / build a feed / call a 3rd party).
      await new Promise((r) => setTimeout(r, 300));
      this.logger.log(`notified about post ${JSON.stringify(job.data)}`);
    }
    return { done: true };
  }
}
