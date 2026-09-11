import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (CSP, HSTS, etc.). Loosen CSP so the GraphQL sandbox loads.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Graceful shutdown: SIGTERM/SIGINT -> onModuleDestroy hooks (Prisma disconnect).
  app.enableShutdownHooks();

  // CORS so the Vite React app (http://localhost:5173) can call this API.
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });

  // API VERSIONING via URI (/v1/...). Unversioned routes stay reachable
  // (VERSION_NEUTRAL default), so /posts etc. are unaffected while
  // /features/version exposes /v1 and /v2.
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: VERSION_NEUTRAL });

  // Global validation: enforces DTO rules, strips unknown props, coerces types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // drop props not in the DTO
      forbidNonWhitelisted: true, // 400 on unknown props
      transform: true, // coerce payloads to DTO types
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
