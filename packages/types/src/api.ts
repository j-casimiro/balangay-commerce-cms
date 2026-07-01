/**
 * HTTP request/response payload contracts exchanged between the storefront and
 * the admin API. Consumed by both sides for compile-time contract enforcement
 * (blueprint §1 — Shared Interface Registry).
 */

import type { Product } from './models';

/** Sort direction accepted by list endpoints (`?sort=field:asc`). */
export type SortDirection = 'asc' | 'desc';

/**
 * Common query parameters accepted by every paginated list endpoint. `sort`
 * uses a `field:direction` string (e.g. `createdAt:desc`); the server validates
 * the field against a per-resource allowlist.
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
}

/** Pagination envelope metadata returned alongside every list `data` array. */
export interface PaginationMeta {
  /** 1-based index of the returned page. */
  page: number;
  /** Number of items requested per page. */
  pageSize: number;
  /** Total number of matching items across all pages. */
  total: number;
  /** Total number of pages given `pageSize` (at least 1). */
  totalPages: number;
  /** Whether a subsequent page exists. */
  hasNextPage: boolean;
  /** Whether a previous page exists. */
  hasPreviousPage: boolean;
}

/**
 * Generic, resource-agnostic list response. Every collection endpoint returns
 * this shape so clients can share a single pagination-handling code path.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Paginated list of products returned by `GET /products`. */
export type ProductListResponse = PaginatedResponse<Product>;

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  currency?: string;
  stock?: number;
  imageUrl?: string | null;
  active?: boolean;
  categoryId?: string | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;

/** Standard error envelope returned by the global exception filter. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  /** Request path that produced the error. */
  path?: string;
  /** ISO 8601 timestamp of when the error was emitted. */
  timestamp?: string;
  /** Correlates the error with server logs (also returned as `x-request-id`). */
  requestId?: string;
}
