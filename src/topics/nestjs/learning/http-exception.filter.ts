/**
 * EXCEPTION FILTERS (NestJS)
 * --------------------------
 * Catch exceptions thrown anywhere in the request lifecycle and shape the error
 * response. Nest has a built-in filter; a custom one standardizes your error
 * contract (code/message/timestamp/path). @Catch() narrows what it handles.
 *
 * This demo catches HttpException and emits a consistent JSON error body.
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();

    res.status(status).json({
      statusCode: status,
      message: exception.message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
