import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@cms/database';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate, parseSort, toSkipTake } from '../common/pagination';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  /** Columns a client is allowed to sort the catalog by (`?sort=field:dir`). */
  private static readonly SORTABLE_FIELDS = [
    'name',
    'priceCents',
    'stock',
    'createdAt',
    'updatedAt',
  ] as const;

  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page, pageSize, sort } = query;
    const where = { active: true };
    const orderBy = parseSort(sort, ProductsService.SORTABLE_FIELDS, {
      createdAt: 'desc',
    });
    const { skip, take } = toSkipTake(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data, total, page, pageSize);
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.product.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException(`Product "${id}" not found`);
    }
  }
}
