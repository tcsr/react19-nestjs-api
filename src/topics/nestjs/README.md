# NestJS Topics

Two kinds of files here:

1. **Wired demo** — the `learning/` module is imported by `AppModule`, so its
   routes are live when the server runs. It demonstrates the full request
   lifecycle on real endpoints (`/learning/*`):

   ```
   Request
     -> Middleware        (RequestLoggerMiddleware)
     -> Guard             (ApiKeyGuard)            can short-circuit -> 403
     -> Interceptor (pre) (TransformInterceptor / LoggingInterceptor)
     -> Pipe              (TrimPipe, ValidationPipe)  validate/transform input
     -> Route handler     (LearningController + custom @CurrentUser decorator)
     -> Interceptor (post)(wrap response, timing)
     -> Exception filter  (HttpExceptionFilter)    only if something throws
   Response
   ```

2. **`*.example.ts` files** — heavily commented reference implementations for
   topics that need extra infra/deps (JWT auth, caching, scheduling, queues,
   gateways, microservices, Swagger). They are NOT wired into the app (excluded
   from the build) so they document the pattern without pulling in dependencies.
   The Redis/queue/event topics get real wiring in the later phases.

See also `docs/notes/` (study notes) and `docs/architecture/` (system design).
