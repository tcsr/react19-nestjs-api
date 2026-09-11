/**
 * E2E TEST — /posts against a real Nest app instance.
 * ---------------------------------------------------
 * E2E boots the whole application (all modules, pipes, DB) and drives it over HTTP
 * with supertest, asserting real responses. Tests the wiring, not just one class.
 *
 * Requires a running PostgreSQL + a valid DATABASE_URL (test DB recommended).
 *   npm i -D supertest @types/supertest
 *   npm run test:e2e
 *
 * NOTE: currently a template — enable once the DB is migrated. Point DATABASE_URL
 * at a disposable TEST database so tests can create/delete freely.
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Posts (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /posts returns an array', async () => {
    const res = await request(app.getHttpServer()).get('/posts?_page=1&_limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /posts validates body (400 on bad input)', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: '' }); // missing/invalid fields
    expect(res.status).toBe(400);
  });

  it('POST then GET a post (round trip)', async () => {
    const created = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'e2e', body: 'hello', userId: 1 });
    expect(created.status).toBe(201);

    const fetched = await request(app.getHttpServer()).get(`/posts/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe('e2e');
  });
});
