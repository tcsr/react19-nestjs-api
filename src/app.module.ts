import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './common/gql-throttler.guard.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PostsModule } from './posts/posts.module.js';
import { LearningModule } from './topics/nestjs/learning/learning.module.js';
import { FeaturesModule } from './topics/nestjs/features/features.module.js';
import { GraphqlDemoModule } from './topics/nestjs/graphql/graphql-demo.module.js';
import { OrderModule } from './topics/ddd/order/order.module.js';
import { validateEnv } from './common/env.validation.js';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { LoggingInterceptor } from './common/logging.interceptor.js';
import { RequestIdMiddleware } from './common/request-id.middleware.js';

@Module({
  imports: [
    // Loads .env app-wide + validates it at boot (fails fast on misconfig).
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Rate limiting: max 100 requests / 60s per IP (global guard below).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    PostsModule,
    LearningModule,
    FeaturesModule,
    GraphqlDemoModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global cross-cutting concerns (DI-enabled).
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Attach a correlation id to every request (all routes).
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
