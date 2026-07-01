// Ensure DATABASE_URL is available before the client (and its driver adapter)
// is constructed, whether this module is loaded by the admin API, the seed
// script, or a Prisma CLI subprocess.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Re-export every generated Prisma model/type so downstream apps consume the
 * single schema origin (blueprint §4.I) exclusively through this package.
 */
export * from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 uses driver adapters instead of a bundled query engine; the pg
// adapter owns the actual PostgreSQL connection pool.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/**
 * Shared singleton Prisma client. The global guard prevents exhausting the
 * connection pool during hot-reload in development.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
