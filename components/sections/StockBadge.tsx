// components/sections/StockBadge.tsx
import type { Product, StockStatus } from '@/lib/types';
import { getStockStatus } from '@/lib/types';

interface StockBadgeProps {
  product: Product;
  className?: string;
}

export function StockBadge({ product, className = '' }: StockBadgeProps) {
  const status = getStockStatus(product);

  if (status === 'in_stock') return null;

  if (status === 'low_stock') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium
          bg-amber-100 text-amber-800 rounded-[var(--radius-button)] ${className}`}
      >
        Only {product.stockOnHand} left
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium
        bg-red-100 text-red-800 rounded-[var(--radius-button)] ${className}`}
    >
      Out of stock
    </span>
  );
}
