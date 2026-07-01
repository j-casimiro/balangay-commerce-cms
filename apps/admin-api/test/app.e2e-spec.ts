import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PRISMA_CLIENT } from '../src/prisma/prisma.module';

/** Minimal Prisma stand-in; only the methods the products slice calls. */
function createMockPrisma() {
  return {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

const sampleProduct = {
  id: 'prod_1',
  name: 'Test Widget',
  slug: 'test-widget',
  description: null,
  priceCents: 1999,
  currency: 'usd',
  stock: 5,
  imageUrl: null,
  active: true,
  categoryId: null,
  category: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Admin API (e2e)', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeAll(async () => {
    prisma = createMockPrisma();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PRISMA_CLIENT)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok status and emits a request id', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);

      expect(res.body).toMatchObject({ status: 'ok' });
      expect(res.body.timestamp).toEqual(expect.any(String));
      expect(res.headers['x-request-id']).toEqual(expect.any(String));
    });

    it('reuses an inbound x-request-id for correlation', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('x-request-id', 'abc-123')
        .expect(200);

      expect(res.headers['x-request-id']).toBe('abc-123');
    });
  });

  describe('GET /products', () => {
    it('returns a paginated envelope with default meta', async () => {
      prisma.product.findMany.mockResolvedValue([sampleProduct]);
      prisma.product.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('prod_1');
      expect(res.body.meta).toEqual({
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('translates page/pageSize into skip/take and computes meta', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(50);

      const res = await request(app.getHttpServer())
        .get('/products?page=3&pageSize=10')
        .expect(200);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(res.body.meta).toMatchObject({
        page: 3,
        pageSize: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('applies a valid, allowlisted sort', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/products?sort=priceCents:asc')
        .expect(200);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { priceCents: 'asc' } }),
      );
    });

    it('rejects an invalid page with the ApiError envelope', async () => {
      const res = await request(app.getHttpServer())
        .get('/products?page=0')
        .expect(400);

      expect(res.body).toMatchObject({ statusCode: 400 });
      expect(Array.isArray(res.body.message)).toBe(true);
      expect(res.body.path).toBe('/products?page=0');
      expect(res.body.requestId).toEqual(expect.any(String));
      expect(res.body.timestamp).toEqual(expect.any(String));
    });

    it('rejects a sort on a field outside the allowlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/products?sort=secret:asc')
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });
  });

  describe('GET /products/:idOrSlug', () => {
    it('returns 404 in the ApiError envelope when not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/products/nope')
        .expect(404);

      expect(res.body).toMatchObject({
        statusCode: 404,
        message: 'Product "nope" not found',
      });
      expect(res.body.timestamp).toEqual(expect.any(String));
    });
  });

  describe('POST /products', () => {
    it('rejects an invalid body with a field-level message array', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Only a name' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(Array.isArray(res.body.message)).toBe(true);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('creates a product for a valid body', async () => {
      prisma.product.create.mockResolvedValue(sampleProduct);

      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test Widget', slug: 'test-widget', priceCents: 1999 })
        .expect(201);

      expect(res.body.id).toBe('prod_1');
      expect(prisma.product.create).toHaveBeenCalledTimes(1);
    });
  });
});
