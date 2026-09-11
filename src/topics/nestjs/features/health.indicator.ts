/**
 * HEALTH CHECKS — custom Prisma indicator (@nestjs/terminus)
 * ---------------------------------------------------------
 * Liveness/readiness endpoints let orchestrators (k8s, load balancers) know if the
 * app is up and its dependencies (DB) reachable. Terminus aggregates indicators;
 * here a custom one pings Postgres with a trivial query.
 */

import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly indicator: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const check = this.indicator.check(key);
    try {
      await this.prisma.$queryRaw`SELECT 1`; // cheap round-trip to the DB
      return check.up();
    } catch (e) {
      return check.down({ message: (e as Error).message });
    }
  }
}
