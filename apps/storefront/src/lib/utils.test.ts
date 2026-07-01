import { describe, expect, it } from 'vitest';

import { cn, formatPrice } from './utils';

describe('formatPrice', () => {
  it('formats integer cents as a USD currency string', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('respects the provided currency code', () => {
    expect(formatPrice(5000, 'eur')).toBe('€50.00');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('cn', () => {
  it('merges conditional class names', () => {
    expect(cn('text-sm', false, 'font-bold')).toBe('text-sm font-bold');
  });

  it('de-duplicates conflicting tailwind utilities (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
