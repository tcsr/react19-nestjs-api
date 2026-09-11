/**
 * PostsController — HTTP layer. Maps routes to service methods.
 * Route prefix: /posts. Query params _page/_limit match the frontend api.ts so
 * pointing React Query's BASE_URL here needs no frontend change.
 * ParseIntPipe coerces + validates numeric params.
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
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

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
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
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
