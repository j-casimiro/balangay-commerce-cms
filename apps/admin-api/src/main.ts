// Load environment variables before anything imports the shared Prisma client.
import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  // bufferLogs so startup logs are held until the pino logger is attached.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Route Nest's built-in logger through pino (structured logs + request ids).
  // The global ValidationPipe and exception filter are registered in AppModule.
  const logger = app.get(Logger);
  app.useLogger(logger);

  const corsOrigin = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({ origin: corsOrigin, credentials: true });

  // OpenAPI / Swagger UI at /docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Balangay Commerce CMS API')
    .setDescription(
      'REST API powering the Balangay Commerce CMS storefront and admin.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.ADMIN_API_PORT ?? 4000);
  await app.listen(port);
  logger.log(
    `Admin API listening on http://localhost:${port} (docs at /docs)`,
    'Bootstrap',
  );
}

void bootstrap();
