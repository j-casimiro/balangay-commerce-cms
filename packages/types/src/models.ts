/**
 * Domain model contracts shared across the storefront and admin API.
 *
 * These are the API-facing (JSON-serialized) shapes: dates are ISO strings and
 * money is expressed in integer minor units (`priceCents`). They intentionally
 * mirror — but are decoupled from — the Prisma models in `@cms/database`, so the
 * public contract can evolve independently of the persistence layer.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Price in the smallest currency unit (e.g. cents). */
  priceCents: number;
  /** ISO 4217 currency code, lowercased (e.g. "usd"). */
  currency: string;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}
