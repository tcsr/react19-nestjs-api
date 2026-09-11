/**
 * LearningController — live demonstration of the NestJS request lifecycle.
 * ----------------------------------------------------------------------
 * Try (server on :3000):
 *   GET  /learning/ping                       -> 401 (guard blocks, no api key)
 *   GET  /learning/ping   -H 'x-api-key: secret'
 *   GET  /learning/whoami -H 'x-api-key: secret' -H 'x-user-id: u1' -H 'x-user-role: admin'
 *   POST /learning/echo   -H 'x-api-key: secret' -d '{ "name": "  spaced  " }'
 *   GET  /learning/boom   -H 'x-api-key: secret' -> exception filter formats the error
 *
 * Decorators applied here show precedence: guard -> interceptor -> pipe -> handler,
 * with the exception filter catching throws.
 */

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard.js';
import { TransformInterceptor } from './transform.interceptor.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { TrimPipe } from './trim.pipe.js';
import { CurrentUser, type CurrentUserShape } from './current-user.decorator.js';

@Controller('learning')
@UseGuards(ApiKeyGuard) // controller-wide: every route requires the api key
@UseInterceptors(TransformInterceptor) // wrap all responses as { data, tookMs }
@UseFilters(HttpExceptionFilter) // standardize thrown HttpExceptions
export class LearningController {
  @Get('ping')
  ping() {
    return 'pong';
  }

  @Get('whoami')
  whoami(@CurrentUser() user: CurrentUserShape) {
    return user; // populated by the custom param decorator
  }

  @Post('echo')
  @UsePipes(TrimPipe) // trims string fields before the handler sees them
  echo(@Body() body: Record<string, unknown>) {
    return { received: body };
  }

  @Get('boom')
  boom() {
    throw new NotFoundException('demo not-found for the exception filter');
  }
}
