/**
 * MetricsInterceptor — records request count + duration per HTTP request.
 * GraphQL/WS-safe (skips when there is no Express req/res).
 */

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { Request, Response } from 'express';
import { MetricsService } from './metrics.service.js';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    if (!req?.method) return next.handle(); // non-HTTP context

    const start = process.hrtime.bigint();
    const finish = () => {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      // Use the route pattern (/posts/:id) not the raw URL, to bound label cardinality.
      const route = (req.route?.path as string) ?? req.path ?? 'unknown';
      this.metrics.record(req.method, route, res.statusCode, seconds);
    };
    return next.handle().pipe(tap({ next: finish, error: finish }));
  }
}
