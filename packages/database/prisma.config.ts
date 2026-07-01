// Prisma 7 configuration (blueprint §4.I — single schema origin).
//
// As of Prisma 7 the connection URL is no longer allowed in schema.prisma.
// Migrate / introspection commands read it from here; the runtime PrismaClient
// gets a driver adapter instead (see src/index.ts).
//
// NOTE: when a Prisma config file is present, Prisma no longer auto-loads .env,
// so we load it explicitly before reading DATABASE_URL.
import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
