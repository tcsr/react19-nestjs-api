/**
 * GLOBAL EXCEPTION FILTER
 * -----------------------
 * Catches EVERYTHING thrown in the request lifecycle and returns a consistent
 * error contract { statusCode, message, path, requestId, timestamp }. Http
 * exceptions keep their status/message; unknown errors become 500 (details logged,
 * not leaked). Bound globally via APP_FILTER so every route is covered.
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { id?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error'; // don't leak internals

    // Log full detail server-side (5xx gets the stack).
    if (status >= 500) {
      this.logger.error(`${req.method} ${req.originalUrl} -> ${status}`, (exception as Error)?.stack);
    } else {
      this.logger.warn(`${req.method} ${req.originalUrl} -> ${status}: ${message}`);
    }

    res.status(status).json({
      statusCode: status,
      message,
      path: req.originalUrl,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  }
}
