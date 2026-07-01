import type { Product, ProductListResponse } from '@cms/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Fetch the active product catalog from the admin API. */
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    // Always read fresh data in this starter; tune caching per environment later.
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as ProductListResponse;
  return json.data;
}
