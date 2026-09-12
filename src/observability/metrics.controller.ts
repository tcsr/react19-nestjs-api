/**
 * MetricsController — GET /metrics in Prometheus text format (scrape target).
 */

import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async scrape(): Promise<string> {
    return this.metrics.registry.metrics();
  }
}
