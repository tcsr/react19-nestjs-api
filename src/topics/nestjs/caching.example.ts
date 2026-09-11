/**
 * CACHING (reference, not wired) — real Redis wiring comes in the Redis phase
 * -------------------------------------------------------------------------
 *   npm i @nestjs/cache-manager cache-manager
 *   # + cache-manager-redis-store (or keyv/redis) for Redis backend
 *
 * NestJS CacheModule provides a unified cache API. In-memory by default; swap the
 * store to Redis for a shared, distributed cache across instances.
 *
 * Two ways to use:
 *  1. Declarative: @UseInterceptors(CacheInterceptor) auto-caches GET responses by
 *     URL (tune with @CacheKey / @CacheTTL).
 *  2. Imperative: inject CACHE_MANAGER and get/set explicitly (cache-aside).
 *
 * Cache-aside pattern (the one to know):
 *   read : cache.get(key) -> hit? return : miss? load DB -> cache.set(key, val, ttl) -> return
 *   write: update DB -> cache.del(key)  (invalidate; or publish an event to invalidate)
 */

/* --- module ---
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      // store: redisStore, host: 'localhost', port: 6379, ttl: 30_000,
    }),
  ],
})
export class AppModule {}
*/

/* --- imperative cache-aside in a service ---
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache, private prisma: PrismaService) {}

  async findOne(id: number) {
    const key = `post:${id}`;
    const cached = await this.cache.get(key);
    if (cached) return cached;                       // HIT
    const post = await this.prisma.post.findUnique({ where: { id } });
    await this.cache.set(key, post, 30_000);         // fill cache (30s TTL)
    return post;
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.prisma.post.update({ where: { id }, data: dto });
    await this.cache.del(`post:${id}`);              // invalidate on write
    return post;
  }
}
*/

export {};
