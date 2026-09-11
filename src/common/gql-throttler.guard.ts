/**
 * GqlThrottlerGuard
 * -----------------
 * The default ThrottlerGuard reads the Express req (req.ip) via switchToHttp(),
 * which is undefined for GraphQL resolvers -> it crashes. This subclass pulls the
 * req/res out of the GraphQL execution context so rate limiting works for both REST
 * and GraphQL. Wired as the global APP_GUARD.
 */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    // GraphQL context carries { req, res }; fall back to HTTP for REST.
    const gqlCtx = GqlExecutionContext.create(context).getContext<{ req?: unknown; res?: unknown }>();
    if (gqlCtx?.req) {
      const req = gqlCtx.req as { res?: unknown };
      return { req, res: (req.res ?? gqlCtx.res) as never } as never;
    }
    return super.getRequestResponse(context);
  }
}
