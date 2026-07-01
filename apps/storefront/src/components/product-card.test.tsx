import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@cms/types';

import { ProductCard } from './product-card';

// next/image pulls in the Next runtime; render a plain <img> under jsdom.
vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => (
    <img src={props.src} alt={props.alt} />
  ),
}));

const product: Product = {
  id: 'p1',
  name: 'Aurora Mug',
  slug: 'aurora-mug',
  description: 'A cozy ceramic mug.',
  priceCents: 1850,
  currency: 'usd',
  stock: 3,
  imageUrl: 'https://example.com/mug.jpg',
  active: true,
  categoryId: 'c1',
  category: {
    id: 'c1',
    name: 'Drinkware',
    slug: 'drinkware',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProductCard', () => {
  it('renders the name, category, formatted price, image, and CTA', () => {
    render(<ProductCard product={product} />);

    expect(
      screen.getByRole('heading', { name: 'Aurora Mug' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Drinkware')).toBeInTheDocument();
    expect(screen.getByText('$18.50')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Aurora Mug' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add to cart/i }),
    ).toBeInTheDocument();
  });

  it('omits the image element when the product has no imageUrl', () => {
    render(<ProductCard product={{ ...product, imageUrl: null }} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
