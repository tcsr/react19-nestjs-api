/**
 * INTERCEPTORS (NestJS)
 * ---------------------
 * Wrap the handler with logic BEFORE and AFTER execution (AOP). Uses RxJS: return
 * next.handle() (the handler's result stream) and pipe operators over it. Uses:
 * transform/wrap responses, logging + timing, caching, mapping errors.
 *
 * This demo wraps every response as { data, tookMs } and logs duration.
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';

export interface Wrapped<T> {
  data: T;
  tookMs: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Wrapped<T>> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<Wrapped<T>> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`[interceptor] handler took ${Date.now() - start}ms`)),
      map((data) => ({ data, tookMs: Date.now() - start })),
    );
  }
}
