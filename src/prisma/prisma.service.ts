/**
 * PrismaService
 * -------------
 * Wraps the generated PrismaClient as an injectable Nest provider. Connects on
 * module init and disconnects on destroy, so the whole app shares one pooled
 * client (a single DB connection pool) via dependency injection.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
