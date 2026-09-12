/**
 * ENV VALIDATION (Zod)
 * --------------------
 * Validate environment variables at boot so a misconfigured deploy fails FAST with
 * a clear message, instead of throwing deep in a request later. Wired into
 * ConfigModule.forRoot({ validate }).
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(8).default('dev-secret-change-me'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    // Flatten Zod issues into a readable message and crash the boot.
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}
