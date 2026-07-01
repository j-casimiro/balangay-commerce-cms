import { BadRequestException } from '@nestjs/common';
import type {
  PaginatedResponse,
  SortDirection,
} from '@cms/types';

/**
 * Build a `PaginatedResponse` envelope from a page of rows and the total count
 * of matching records. Keeps the pagination math in one place so every list
 * endpoint returns identical `meta`.
 */
export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/** Translate a 1-based page + size into Prisma `skip`/`take`. */
export function toSkipTake(
  page: number,
  pageSize: number,
): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

/**
 * Parse a `field:direction` sort string into a Prisma `orderBy` object, guarding
 * `field` against a per-resource allowlist (prevents ordering by arbitrary
 * columns). Returns `fallback` when `sort` is omitted; throws
 * `BadRequestException` for an unknown field or an invalid direction.
 */
export function parseSort<TField extends string>(
  sort: string | undefined,
  allowedFields: readonly TField[],
  fallback: Record<string, SortDirection>,
): Record<string, SortDirection> {
  if (!sort) {
    return fallback;
  }

  const [field, direction = 'asc'] = sort.split(':');

  if (!allowedFields.includes(field as TField)) {
    throw new BadRequestException(
      `Cannot sort by "${field}". Allowed fields: ${allowedFields.join(', ')}.`,
    );
  }
  if (direction !== 'asc' && direction !== 'desc') {
    throw new BadRequestException(
      `Invalid sort direction "${direction}". Use "asc" or "desc".`,
    );
  }

  return { [field]: direction };
}
