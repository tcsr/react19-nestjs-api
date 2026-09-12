/**
 * METRICS (Prometheus via prom-client)
 * ------------------------------------
 * Exposes app metrics for Prometheus to scrape at GET /metrics. Tracks the RED
 * signals: Rate + Errors (http_requests_total by status) and Duration
 * (http_request_duration_seconds histogram). Plus Node default metrics (event-loop
 * lag, memory, GC). Prometheus scrapes /metrics; Grafana graphs it.
 */

import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequests: Counter<string>;
  readonly httpDuration: Histogram<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.httpRequests = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.registry],
    });
  }

  record(method: string, route: string, status: number, seconds: number) {
    const labels = { method, route, status: String(status) };
    this.httpRequests.inc(labels);
    this.httpDuration.observe(labels, seconds);
  }
}
