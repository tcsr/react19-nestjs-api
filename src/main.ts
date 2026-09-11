import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS so the Vite React app (http://localhost:5173) can call this API.
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });

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
