/**
 * MIDDLEWARE (NestJS)
 * -------------------
 * Runs FIRST in the request lifecycle, before guards/interceptors/pipes. Has
 * access to req/res and next() (Express-style). Use for logging, correlation IDs,
 * raw body handling, CORS-like concerns. Cannot access the route handler's
 * decorators/DI-resolved handler result. Bound in a module's configure() via
 * MiddlewareConsumer.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    console.log(`[mw] ${req.method} ${req.originalUrl}`);
    next(); // MUST call next() or the request hangs
  }
}
