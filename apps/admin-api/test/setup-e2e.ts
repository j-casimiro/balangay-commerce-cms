// Runs before any module (and therefore before AppModule reads process.env).

process.env.NODE_ENV = 'test';

// Keep the rate limiter effectively disabled for functional specs; the limiter
// itself is covered by throttler.e2e-spec.ts with its own low limit.
process.env.THROTTLE_LIMIT = process.env.THROTTLE_LIMIT ?? '1000';

// The @cms/database client is constructed at import time; give it a dummy URL so
// it builds without a real database. Specs override PRISMA_CLIENT with a mock,
// so no query ever reaches Postgres.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
