/**
 * OPENTELEMETRY TRACING bootstrap.
 * --------------------------------
 * Must be imported FIRST (before Nest/Express/Prisma) so auto-instrumentation can
 * patch those libraries. It creates a SPAN per incoming request + outgoing call
 * (HTTP, Prisma, Redis, etc.) tied by a trace id — the same trace id would
 * propagate across services in a distributed setup (W3C traceparent header).
 *
 * Here spans print to the console (ConsoleSpanExporter). In production you'd export
 * via OTLP to Jaeger/Tempo/Grafana. Disabled unless OTEL_ENABLED=1 to keep normal
 * runs quiet.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

if (process.env.OTEL_ENABLED === '1') {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'react19-nestjs-api' }),
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  sdk.start();
  process.on('SIGTERM', () => void sdk.shutdown());
  // eslint-disable-next-line no-console
  console.log('[otel] tracing started (console exporter)');
}
