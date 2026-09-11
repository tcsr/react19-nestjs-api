/**
 * LOGGING INTERCEPTOR
 * -------------------
 * Logs one line per request with method, url, status timing, and the request id.
 * Bound globally via APP_INTERCEPTOR. In production swap the Nest Logger for a
 * structured JSON logger (pino) so logs are queryable + correlated by requestId.
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { id?: string }>();
    const start = Date.now();
    return next.handle().pipe(
      tap(() =>
        this.logger.log(`[${req.id}] ${req.method} ${req.originalUrl} ${Date.now() - start}ms`),
      ),
    );
  }
}
