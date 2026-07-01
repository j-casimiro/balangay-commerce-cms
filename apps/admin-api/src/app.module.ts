import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MutationThrottlerGuard } from './common/guards/mutation-throttler.guard';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';

const nodeEnv = process.env.NODE_ENV;
const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';
// Pretty, human-readable logs in local dev; JSON in prod; silent under tests.
const logLevel = process.env.LOG_LEVEL ?? (isTest ? 'silent' : isProd ? 'info' : 'debug');
const usePrettyLogs = !isProd && !isTest;

/** Reuse an inbound `x-request-id` when present, otherwise mint one, and echo
 * it back on the response so clients and logs share a correlation id. */
function genReqId(req: IncomingMessage, res: ServerResponse): string {
  const header = req.headers['x-request-id'];
  const id = (Array.isArray(header) ? header[0] : header) ?? randomUUID();
  res.setHeader('x-request-id', id);
  return id;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: logLevel,
        genReqId,
        // Keep the liveness probe out of the request log.
        autoLogging: { ignore: (req: IncomingMessage) => req.url === '/health' },
        // Never leak credentials into logs (relevant once auth lands, Epic 1.1).
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport: usePrettyLogs
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.THROTTLE_TTL ?? 60_000),
          limit: Number(process.env.THROTTLE_LIMIT ?? 20),
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    ProductsModule,
  ],
  providers: [
    // Register cross-cutting concerns at the module level so both the running
    // app and e2e tests (which bootstrap AppModule directly) share identical
    // request handling.
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
    // Serialize every error into the shared `ApiError` envelope.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Global rate limiting scoped to mutations by MutationThrottlerGuard.
    { provide: APP_GUARD, useClass: MutationThrottlerGuard },
  ],
})
export class AppModule {}
