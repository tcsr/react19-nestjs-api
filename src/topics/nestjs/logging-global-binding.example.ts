/**
 * LOGGING & GLOBAL BINDING (reference)
 * ------------------------------------
 *
 * LOGGING — Nest's built-in Logger:
 *   private readonly logger = new Logger(MyService.name);
 *   this.logger.log('info'); this.logger.warn(...); this.logger.error(msg, stack);
 *   Set levels in main: NestFactory.create(AppModule, { logger: ['error','warn','log'] }).
 *   Production: swap in a structured JSON logger (pino via nestjs-pino) + a request
 *   id (middleware) so logs correlate across a request.
 *
 * GLOBAL BINDING — apply a guard/pipe/interceptor/filter APP-WIDE.
 *   Two ways:
 *   1. In main.ts (no DI): app.useGlobalPipes(new ValidationPipe()) — used here.
 *   2. As a provider (DI-enabled) using APP_* tokens — preferred when the
 *      guard/interceptor needs injected dependencies:
 */

/* --- DI-enabled global providers (in a module) ---
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_GUARD, useClass: JwtAuthGuard },       // guards every route
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
// Order for multiple globals of the same kind follows provider registration.
*/

/* --- structured logging with request id ---
// middleware attaches req.id = randomUUID();
this.logger.log(`[${req.id}] handled in ${ms}ms`);
*/

export {};
