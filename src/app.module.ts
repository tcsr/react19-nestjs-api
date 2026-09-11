import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PostsModule } from './posts/posts.module.js';
import { LearningModule } from './topics/nestjs/learning/learning.module.js';
import { FeaturesModule } from './topics/nestjs/features/features.module.js';
import { GraphqlDemoModule } from './topics/nestjs/graphql/graphql-demo.module.js';

@Module({
  imports: [
    // Loads .env into process.env app-wide.
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PostsModule,
    LearningModule,
    FeaturesModule,
    GraphqlDemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
