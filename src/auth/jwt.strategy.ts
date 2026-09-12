/**
 * JWT STRATEGY (Passport)
 * -----------------------
 * Validates the Bearer token on protected routes: extracts it from the
 * Authorization header, verifies the signature + expiry with JWT_SECRET, and
 * returns the payload — Nest attaches it to req.user. The @Roles guard reads
 * req.user.role for authorization.
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'admin' | 'user';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    });
  }

  // Return value becomes req.user.
  validate(payload: JwtPayload) {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
