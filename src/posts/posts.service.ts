/**
 * PostsService — business logic + data access (via PrismaService).
 * Controllers stay thin; services own the logic and are unit-testable.
 * This is where Redis cache-aside and event publishing (EventBridge) will hook in
 * during later phases.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // Paginated list. page/limit map to Prisma skip/take.
  findAll(page = 1, limit = 5) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    return this.prisma.post.findMany({ skip, take, orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  create(dto: CreatePostDto) {
    return this.prisma.post.create({ data: dto });
  }

  async update(id: number, dto: UpdatePostDto) {
    await this.findOne(id); // 404 if missing
    return this.prisma.post.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.post.delete({ where: { id } });
    return { deleted: true };
  }
}
