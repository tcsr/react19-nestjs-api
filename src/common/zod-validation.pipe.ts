/**
 * ZodValidationPipe
 * -----------------
 * Validates a handler input against a Zod schema and returns the parsed (typed)
 * value, or throws 400 with readable messages. Lets a single Zod contract drive
 * request validation — the Zod counterpart to class-validator DTOs.
 */

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      );
    }
    return result.data;
  }
}
