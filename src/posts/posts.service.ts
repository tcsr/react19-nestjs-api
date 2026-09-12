/**
 * PostsService — business logic + data access (via PrismaService).
 * Controllers stay thin; services own the logic and are unit-testable.
 * This is where Redis cache-aside and event publishing (EventBridge) will hook in
 * during later phases.
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../jobs/notifications.service.js';
import type { CreatePost, UpdatePost } from '../contracts/post.contract.js';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly notifications: NotificationsService,
  ) {}

  private key(id: number) {
    return `post:${id}`;
  }
  // Invalidate a post's cache entry on any write (cache-aside invalidation).
  private async invalidate(id: number) {
    await this.cache.del(this.key(id));
  }

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
    // CACHE-ASIDE: try cache first; on miss, read DB then populate cache.
    const cached = await this.cache.get(this.key(id));
    if (cached) return cached;

    // Treat soft-deleted rows as not found.
    const post = await this.prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);

    await this.cache.set(this.key(id), post); // default TTL from cache config
    return post;
  }

  async create(dto: CreatePost) {
    const post = await this.prisma.post.create({ data: dto });
    // Offload follow-up work (notify/index) to the queue — return fast.
    await this.notifications.postCreated(post.id);
    return post;
  }

  async update(id: number, dto: UpdatePost) {
    await this.findOne(id); // 404 if missing
    const updated = await this.prisma.post.update({ where: { id }, data: dto });
    await this.invalidate(id); // keep cache consistent with the DB
    return updated;
  }

  // SOFT DELETE: mark the row instead of physically deleting it (data preserved,
  // reversible, audit-friendly). A hard delete would be irreversible.
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.invalidate(id);
    return { deleted: true };
  }

  // Undo a soft delete (impossible with a hard delete).
  async restore(id: number) {
    await this.prisma.post.update({ where: { id }, data: { deletedAt: null } });
    await this.invalidate(id);
    return { restored: true };
  }
}
