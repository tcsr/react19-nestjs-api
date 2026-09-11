/**
 * FeaturesController — wired demos for serialization, uploads, health, versioning.
 * Routes:
 *   GET  /health                         -> terminus health (DB ping)
 *   GET  /features/user                  -> serialized entity (password hidden)
 *   POST /features/upload (multipart)    -> file upload metadata
 *   GET  /features/version (v1 & v2)     -> URI versioning
 */

import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { UserEntity } from './user.entity.js';
import { PrismaHealthIndicator } from './health.indicator.js';

@Controller('features')
export class FeaturesController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  // SERIALIZATION: returns a class instance; interceptor strips @Exclude fields.
  @Get('user')
  @UseInterceptors(ClassSerializerInterceptor)
  getUser() {
    return new UserEntity({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'SUPER_SECRET_HASH', // will NOT appear in the response
      name: 'Ada',
    });
  }

  // FILE UPLOAD: multipart/form-data field "file".
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return { originalName: file?.originalname, size: file?.size, mime: file?.mimetype };
  }

  // API VERSIONING: same path, two versions selected by URI prefix (/v1, /v2).
  @Get('version')
  @Version('1')
  versionV1() {
    return { version: 'v1', shape: 'legacy' };
  }

  @Get('version')
  @Version('2')
  versionV2() {
    return { version: 'v2', shape: 'improved', extra: true };
  }
}

// Health lives at /health (separate controller path).
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }
}
