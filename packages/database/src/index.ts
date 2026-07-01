import { PrismaClient } from '@prisma/client';

/**
 * Re-export every generated Prisma model/type so downstream apps consume the
 * single schema origin (blueprint §4.I) exclusively through this package.
 */
export * from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Shared singleton Prisma client. The global guard prevents exhausting the
 * connection pool during hot-reload in development.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
