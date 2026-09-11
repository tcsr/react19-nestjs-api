/**
 * QUEUES & SCHEDULING (reference, not wired) — real wiring in Redis/EventBridge phase
 * ---------------------------------------------------------------------------------
 *
 * SCHEDULING (@nestjs/schedule):
 *   npm i @nestjs/schedule
 *   ScheduleModule.forRoot() then decorate methods:
 *     @Cron('0 * * * * *')   run every minute (cron expression)
 *     @Interval(10000)       run every 10s
 *     @Timeout(5000)         run once after 5s
 *   Use for periodic cleanup, cache warming, digests.
 *
 * QUEUES (BullMQ via @nestjs/bullmq, backed by Redis):
 *   npm i @nestjs/bullmq bullmq
 *   Offload slow/async work (email, thumbnails, aggregation) from the request path:
 *   producer adds a job; a worker processor consumes it. Gives retries, backoff,
 *   rate limiting, delayed jobs, and a dead-letter concept — the async backbone.
 */

/* --- scheduling ---
import { Cron, Interval } from '@nestjs/schedule';
@Injectable()
export class TasksService {
  @Cron('0 0 * * *')  // daily at midnight
  handleDailyCleanup() { /* ... *\/ }

  @Interval(10_000)
  heartbeat() { /* ... *\/ }
}
*/

/* --- queue producer ---
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private queue: Queue) {}
  async sendWelcome(userId: string) {
    // Return fast; work happens in the worker.
    await this.queue.add('welcome', { userId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
  }
}
*/

/* --- queue worker (processor) ---
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === 'welcome') { /* send email; throw to trigger retry *\/ }
  }
}
*/

export {};
