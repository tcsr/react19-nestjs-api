/**
 * Cache configuration — Redis-backed via Keyv.
 * --------------------------------------------
 * @nestjs/cache-manager (cache-manager v7) uses Keyv stores. Here we back the cache
 * with Redis so it is SHARED across app instances (a per-instance in-memory cache
 * would be inconsistent behind a load balancer). REDIS_URL from env.
 */

import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

export const AppCacheModule = CacheModule.registerAsync({
  isGlobal: true,
  useFactory: () => ({
    stores: [createKeyv(process.env.REDIS_URL ?? 'redis://localhost:6379')],
    ttl: 30_000, // default 30s
  }),
});
