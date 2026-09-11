/**
 * PIPES (NestJS)
 * --------------
 * Pipes TRANSFORM or VALIDATE handler inputs (body/param/query) just before the
 * handler runs. Built-ins: ValidationPipe (DTO rules), ParseIntPipe, ParseUUIDPipe,
 * DefaultValuePipe. Custom pipes implement transform(value, metadata).
 *
 * This demo trims whitespace from every string field of the incoming body.
 */

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (typeof v === 'string') (value as Record<string, unknown>)[k] = v.trim();
      }
    }
    return value;
  }
}
