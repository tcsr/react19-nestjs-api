/**
 * AuthController — login + protected demo routes.
 * ----------------------------------------------
 *   POST /auth/login  { username, password }  -> { access_token }
 *   GET  /auth/me     (JwtAuthGuard)           -> the current user (any role)
 *   GET  /auth/admin  (JwtAuthGuard + RolesGuard + @Roles('admin')) -> admin only
 *
 * Users are in-memory for the demo; a real app checks a hashed password in the DB
 * (see node/crypto notes for scrypt/bcrypt).
 */

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard, RolesGuard, Roles } from './guards.js';

const USERS = [
  { id: '1', username: 'alice', password: 'password', role: 'admin' as const },
  { id: '2', username: 'bob', password: 'password', role: 'user' as const },
];

@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    const user = USERS.find((u) => u.username === body.username && u.password === body.password);
    if (!user) throw new UnauthorizedException('Bad credentials');
    // Sign a short-lived access token with identity + role claims.
    const access_token = this.jwt.sign({ sub: user.id, username: user.username, role: user.role });
    return { access_token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: unknown }) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminOnly() {
    return { secret: 'admins only' };
  }
}
