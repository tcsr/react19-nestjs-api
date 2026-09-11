/**
 * PostsController — HTTP layer. Maps routes to service methods.
 * Route prefix: /posts. Query params _page/_limit match the frontend api.ts so
 * pointing React Query's BASE_URL here needs no frontend change.
 * Validation via the shared Zod CONTRACT (src/contracts/post.contract.ts) —
 * one schema for validation + types, mirrored on the frontend.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import {
  createPostSchema,
  updatePostSchema,
  type CreatePost,
  type UpdatePost,
} from '../contracts/post.contract.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  findAll(
    @Query('_page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('_limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.posts.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.posts.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createPostSchema)) dto: CreatePost) {
    return this.posts.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updatePostSchema)) dto: UpdatePost,
  ) {
    return this.posts.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.posts.remove(id); // soft delete
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.posts.restore(id);
  }
}
