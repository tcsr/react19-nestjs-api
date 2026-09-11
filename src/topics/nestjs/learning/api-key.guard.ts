/**
 * GUARDS (NestJS)
 * ---------------
 * A guard decides whether a request may proceed to the handler — used for
 * authentication/authorization. Runs AFTER middleware, BEFORE interceptors/pipes.
 * canActivate() returns boolean (or Promise/Observable). Returning false throws
 * 403 automatically. Guards read metadata (roles via @SetMetadata + Reflector) to
 * implement RBAC.
 *
 * This demo: allow the request only if header `x-api-key: secret` is present.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-api-key'];
    if (key !== 'secret') {
      throw new UnauthorizedException('Missing or invalid x-api-key');
    }
    return true;
  }
}
