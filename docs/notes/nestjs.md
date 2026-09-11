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

## Testing (wired: `src/posts/posts.service.spec.ts`, `test/posts.e2e-spec.ts`)
- **Unit**: `Test.createTestingModule` + override providers with mocks (mock
  PrismaService) → fast, no DB. Test one class in isolation.
- **E2E**: boot the app (`createNestApplication`) + drive over HTTP with supertest;
  needs a real DB (use a disposable test DB). `npm test` (unit) / `npm run test:e2e`.
- **Quick Q**: unit vs e2e? → isolate a class with mocks vs boot the whole app + DB.

## Serialization (wired: `/features/user`)
- `class-transformer` + `ClassSerializerInterceptor`: `@Exclude()` hides fields
  (password hashes), `@Expose({name})` renames. Handler must return a class
  instance. Keeps secrets out of responses.

## Health checks (wired: `/health`)
- `@nestjs/terminus` + `@HealthCheck()`; custom indicator pings Postgres. Liveness/
  readiness for orchestrators.

## API versioning (wired: `/v1|/v2/features/version`)
- `enableVersioning({ type: URI })`; `@Version('1')` per route; `VERSION_NEUTRAL`
  keeps unversioned routes working.

## File uploads (wired: `/features/upload`)
- `FileInterceptor('file')` (Multer) + `@UploadedFile()`; `Express.Multer.File`.

## GraphQL (wired: `/graphql`)
- Code-first: `@ObjectType/@Field` models, `@Resolver` + `@Query/@Mutation/@Args`;
  `autoSchemaFile` generates SDL. Client asks for exactly the fields it needs from
  one endpoint. `@ResolveField` lazily resolves relations (over/under-fetch fix).
- **Quick Q**: REST vs GraphQL? → many endpoints/fixed shapes vs one endpoint/
  client-selected fields + aggregation.

## Logging & global binding (ref: `logging-global-binding.example.ts`)
- Built-in `Logger`; production → structured JSON (pino) + request-id middleware.
- Global cross-cutting: `useGlobalPipes` (no DI) OR `APP_PIPE/APP_GUARD/
  APP_INTERCEPTOR/APP_FILTER` providers (DI-enabled).

## Quick Q
- Lifecycle order? → middleware, guard, interceptor, pipe, handler, interceptor,
  filter.
- Guard vs interceptor vs pipe? → allow/deny · wrap/transform I/O · validate/coerce
  input.
- Cross-cutting response shape? → interceptor. Standard error body? → filter.
- Share a provider everywhere? → `@Global()` module + export it.
- Why services thin controllers? → testable logic, reuse, separation.
