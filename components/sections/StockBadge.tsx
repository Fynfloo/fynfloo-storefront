// components/sections/StockBadge.tsx
import { getStockStatus, type Product } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface StockBadgeProps {
  product: Product;
  className?: string;
}

export function StockBadge({ product, className = '' }: StockBadgeProps) {
  const status = getStockStatus(product);
  if (status === 'in_stock') return null;
  if (status === 'low_stock') {
    return (
      <Badge variant="warning" className={className}>
        Only {product.stockOnHand} left
      </Badge>
    );
  }
  return (
    <Badge variant="danger" className={className}>
      Out of stock
    </Badge>
  );
}
