import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
