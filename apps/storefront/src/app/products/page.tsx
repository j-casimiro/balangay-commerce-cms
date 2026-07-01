import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/api';

// Server Component: fetches from the admin API on each request, proving the
// full data path DB -> Prisma -> NestJS -> HTTP -> Next.js.
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let products;
  try {
    products = await getProducts();
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="mt-4 text-muted-foreground">
          Could not reach the admin API at{' '}
          {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}. Make sure
          it is running (<code>pnpm dev</code>) and the database has been seeded (
          <code>pnpm db:seed</code>).
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      <p className="mt-2 text-muted-foreground">{products.length} items</p>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
