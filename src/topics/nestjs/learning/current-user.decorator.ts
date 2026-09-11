/**
 * CUSTOM PARAM DECORATORS (NestJS)
 * --------------------------------
 * createParamDecorator builds reusable decorators that extract data from the
 * request into a handler parameter — e.g. @CurrentUser() instead of reading
 * req.user everywhere. Keeps controllers clean and declarative.
 *
 * Here we fake a user from a header; in real apps a guard populates req.user
 * (e.g. from a validated JWT) and this decorator reads it.
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface CurrentUserShape {
  id: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserShape => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return {
      id: (req.headers['x-user-id'] as string) ?? 'anonymous',
      role: (req.headers['x-user-role'] as string) ?? 'guest',
    };
  },
);
