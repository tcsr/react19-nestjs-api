/**
 * FeaturesModule — bundles the extra-feature demos (serialization, uploads,
 * health, versioning). TerminusModule provides the health-check services.
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { FeaturesController, HealthController } from './features.controller.js';
import { PrismaHealthIndicator } from './health.indicator.js';

@Module({
  imports: [TerminusModule],
  controllers: [FeaturesController, HealthController],
  providers: [PrismaHealthIndicator],
})
export class FeaturesModule {}
