# NestJS — Study Notes

Code: `src/topics/nestjs/` (wired `learning/` + `*.example.ts` references)

## Architecture
- **Modules** — organize the app; each has providers/controllers/imports/exports.
  Root `AppModule` composes feature modules. `@Global()` shares a provider app-wide.
- **Controllers** — HTTP layer; map routes to handlers (`@Get/@Post/...`, params
  via `@Param/@Query/@Body`). Keep thin.
- **Providers/Services** — business logic + data access, `@Injectable()`,
  DI-managed. Own the logic (testable).
- **DI** — IoC container injects by type via constructor. Custom providers:
  `useValue/useClass/useFactory` + `@Inject(token)`.

## Request lifecycle (ORDER — memorize)
`Middleware → Guards → Interceptors(pre) → Pipes → Handler → Interceptors(post) → Exception filters`
- **Middleware** — first; req/res/next (Express). Bound in `configure()`. Logging,
  correlation ids.
- **Guards** — authZ/authN; `canActivate` → false = 403. RBAC via `@SetMetadata`
  + `Reflector`.
- **Interceptors** — AOP wrap (before/after) via RxJS; transform responses, timing,
  caching, error mapping.
- **Pipes** — validate/transform input; `ValidationPipe` (DTO), `ParseIntPipe`, or
  custom `transform()`.
- **Exception filters** — shape error responses; `@Catch()`; standardize contract.
- **Custom param decorators** — `createParamDecorator` (e.g. `@CurrentUser()`).

## DTOs & validation
- DTO classes + `class-validator` decorators; global `ValidationPipe({ whitelist,
  forbidNonWhitelisted, transform })` enforces + strips + coerces.
- `PartialType(CreateDto)` for PATCH.
- **Gotcha**: `transform: true` needed to coerce query/param types into DTO types.

## Provider scopes
- **DEFAULT** singleton (use this) · **REQUEST** per request (bubbles, perf cost) ·
  **TRANSIENT** per consumer.

## Dynamic modules
- Configured at import via static `forRoot`/`forFeature` returning `DynamicModule`
  (ConfigModule, JwtModule, TypeOrmModule pattern).

## Lifecycle hooks
- `onModuleInit`, `onApplicationBootstrap`, `onModuleDestroy`,
  `onApplicationShutdown`. `app.enableShutdownHooks()` for SIGTERM graceful stop.
  PrismaService connects/disconnects here.

## Advanced (see *.example.ts)
- **Auth**: Passport strategies + `JwtAuthGuard` + `RolesGuard` (RBAC); enforce on
  server.
- **Caching**: `CacheModule` (Redis store) — declarative `CacheInterceptor` or
  imperative cache-aside.
- **Scheduling**: `@Cron/@Interval/@Timeout`.
- **Queues**: BullMQ (Redis) — offload async work, retries/backoff.
- **WebSockets**: `@WebSocketGateway` + `@SubscribeMessage`; Redis adapter to scale.
- **Microservices**: transports (TCP/Redis/Kafka/gRPC); `@MessagePattern` (RPC) vs
  `@EventPattern` (events).
- **Swagger**: `@nestjs/swagger` auto docs from decorators.

## Quick Q
- Lifecycle order? → middleware, guard, interceptor, pipe, handler, interceptor,
  filter.
- Guard vs interceptor vs pipe? → allow/deny · wrap/transform I/O · validate/coerce
  input.
- Cross-cutting response shape? → interceptor. Standard error body? → filter.
- Share a provider everywhere? → `@Global()` module + export it.
- Why services thin controllers? → testable logic, reuse, separation.
