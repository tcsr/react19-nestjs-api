/**
 * PostsModule — bundles the posts feature (controller + service).
 * Nest modules group related providers; PrismaService comes from the @Global
 * PrismaModule so it doesn't need importing here.
 */

import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
