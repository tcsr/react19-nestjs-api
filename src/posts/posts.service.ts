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

  // Paginated list — LIVE rows only (soft-deleted rows are hidden, not gone).
  findAll(page = 1, limit = 5) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    return this.prisma.post.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    // Treat soft-deleted rows as not found.
    const post = await this.prisma.post.findFirst({ where: { id, deletedAt: null } });
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

  // SOFT DELETE: mark the row instead of physically deleting it (data preserved,
  // reversible, audit-friendly). A hard delete would be irreversible.
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  // Undo a soft delete (impossible with a hard delete).
  async restore(id: number) {
    await this.prisma.post.update({ where: { id }, data: { deletedAt: null } });
    return { restored: true };
  }
}
