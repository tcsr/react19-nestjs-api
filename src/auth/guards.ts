/**
 * AUTH GUARDS + @Roles decorator
 * ------------------------------
 * JwtAuthGuard  — runs the 'jwt' Passport strategy; 401 if the token is missing or
 *                 invalid. Populates req.user.
 * RolesGuard    — RBAC: reads roles required by @Roles(...) metadata via Reflector
 *                 and checks req.user.role; 403 if not allowed. Runs AFTER JwtAuthGuard.
 *
 * Client authorization is enforced on the SERVER — never trust the client.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true; // no role restriction
    const { user } = ctx.switchToHttp().getRequest<{ user?: { role?: string } }>();
    if (!user?.role || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
