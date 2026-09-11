/**
 * UNIT TEST — PostsService with a mocked PrismaService.
 * ----------------------------------------------------
 * Unit tests isolate the class under test: replace real dependencies (the DB) with
 * mocks so tests are fast, deterministic, and need no Postgres. Uses Nest's
 * Test.createTestingModule to build a mini DI container and override the provider.
 *
 * Run: npm test   (vitest, no database required)
 */

import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostsService } from './posts.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

// A hand-rolled mock of the Prisma methods the service uses.
const prismaMock = {
  post: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        // Override the real PrismaService with our mock.
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  it('findAll maps page/limit to skip/take', async () => {
    prismaMock.post.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await service.findAll(2, 5);

    expect(prismaMock.post.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null }, // live rows only (soft delete)
      skip: 5, // (2-1)*5
      take: 5,
      orderBy: { id: 'asc' },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('findOne throws NotFoundException when missing (or soft-deleted)', async () => {
    prismaMock.post.findFirst.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove soft-deletes (update deletedAt), not a hard delete', async () => {
    prismaMock.post.findFirst.mockResolvedValue({ id: 1 });
    await service.remove(1);
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) },
    });
    expect(prismaMock.post.delete).not.toHaveBeenCalled();
  });

  it('create delegates to prisma.post.create', async () => {
    const dto = { title: 't', body: 'b', userId: 1 };
    prismaMock.post.create.mockResolvedValue({ id: 1, ...dto });
    const result = await service.create(dto);

    expect(prismaMock.post.create).toHaveBeenCalledWith({ data: dto });
    expect(result.id).toBe(1);
  });
});
