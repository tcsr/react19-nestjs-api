/**
 * GRAPHQL RESOLVER
 * ----------------
 * A resolver is GraphQL's controller: @Query for reads, @Mutation for writes,
 * @Args for arguments. Reuses the same PrismaService as the REST layer — one data
 * source, two API styles. (@ResolveField would resolve nested relations lazily,
 * solving over/under-fetching.)
 */

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostModel, CreatePostInput } from './post.model.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Resolver(() => PostModel)
export class PostResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [PostModel], { name: 'posts' })
  posts(@Args('take', { type: () => Int, defaultValue: 5 }) take: number) {
    return this.prisma.post.findMany({ take, orderBy: { id: 'asc' } });
  }

  @Query(() => PostModel, { name: 'post', nullable: true })
  post(@Args('id', { type: () => Int }) id: number) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  @Mutation(() => PostModel)
  createPost(@Args('input') input: CreatePostInput) {
    return this.prisma.post.create({ data: input });
  }
}
