/**
 * REQUEST-ID MIDDLEWARE
 * ---------------------
 * Assigns each request a correlation id (reuse an incoming x-request-id if present,
 * else generate one), exposes it on req.id and the response header. Every log line
 * + error response can then be tied to one request — essential once requests span
 * multiple services (pass the id through to downstream calls / Kafka headers).
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { id?: string }, res: Response, next: NextFunction) {
    const incoming = req.headers['x-request-id'];
    req.id = (typeof incoming === 'string' && incoming) || randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
  }
}
