/**
 * HTTP request/response payload contracts exchanged between the storefront and
 * the admin API. Consumed by both sides for compile-time contract enforcement
 * (blueprint §1 — Shared Interface Registry).
 */

import type { Product } from './models';

export interface ProductListResponse {
  data: Product[];
  total: number;
}

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

/** Standard error envelope returned by the NestJS exception filter. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
