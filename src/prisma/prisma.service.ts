/**
 * PrismaService
 * -------------
 * Wraps the generated PrismaClient as an injectable Nest provider. Connects on
 * module init and disconnects on destroy, so the whole app shares one pooled
 * client (a single DB connection pool) via dependency injection.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7 requires a DRIVER ADAPTER to connect. PrismaPg wraps the `pg`
    // driver; the connection string comes from DATABASE_URL (loaded by ConfigModule).
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
