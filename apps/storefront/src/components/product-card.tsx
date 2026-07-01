import Image from 'next/image';
import type { Product } from '@cms/types';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </span>
        ) : null}

        <h3 className="font-medium leading-tight">{product.name}</h3>

        {product.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          <Button size="sm">Add to cart</Button>
        </div>
      </div>
    </div>
  );
}
