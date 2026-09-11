/**
 * LearningModule — bundles the lifecycle demo and binds middleware.
 * Implements NestModule.configure() to attach RequestLoggerMiddleware to the
 * /learning routes (middleware is bound here, not via decorators).
 */

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LearningController } from './learning.controller.js';
import { RequestLoggerMiddleware } from './request-logger.middleware.js';

@Module({
  controllers: [LearningController],
})
export class LearningModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('learning');
  }
}
