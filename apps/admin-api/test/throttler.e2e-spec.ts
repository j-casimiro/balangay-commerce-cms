import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';

import { MutationThrottlerGuard } from '../src/common/guards/mutation-throttler.guard';

@Controller('things')
class ThingsController {
  @Get()
  find() {
    return { ok: true };
  }

  @Post()
  create() {
    return { ok: true };
  }
}

describe('MutationThrottlerGuard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 2 }] }),
      ],
      controllers: [ThingsController],
      providers: [{ provide: APP_GUARD, useClass: MutationThrottlerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('never throttles safe GET requests', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).get('/things').expect(200);
    }
  });

  it('throttles mutating requests past the configured limit', async () => {
    await request(app.getHttpServer()).post('/things').expect(201);
    await request(app.getHttpServer()).post('/things').expect(201);
    // Third POST within the window exceeds the limit of 2.
    await request(app.getHttpServer()).post('/things').expect(429);
  });
});
