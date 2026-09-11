/**
 * AUTHENTICATION — JWT + Guards (reference, not wired)
 * ---------------------------------------------------
 * NestJS auth typically uses Passport strategies + guards.
 *   npm i @nestjs/passport passport @nestjs/jwt passport-jwt
 *
 * Flow:
 *  1. POST /auth/login validates credentials -> signs a JWT (access token).
 *  2. Client sends Authorization: Bearer <token>.
 *  3. A JwtAuthGuard (Passport 'jwt' strategy) validates the token and populates
 *     req.user. A RolesGuard + @Roles() metadata does authorization (RBAC).
 *
 * Access token short-lived; refresh token (httpOnly cookie) for silent refresh.
 * Enforce authorization on the SERVER — client checks are cosmetic.
 */

/* --- auth.module.ts ---
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
*/

/* --- jwt.strategy.ts ---
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
  // Return value becomes req.user.
  async validate(payload: { sub: string; role: string }) {
    return { id: payload.sub, role: payload.role };
  }
}
*/

/* --- roles.guard.ts (RBAC) ---
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}
// usage: @Roles('admin') @UseGuards(JwtAuthGuard, RolesGuard)
*/

export {};
