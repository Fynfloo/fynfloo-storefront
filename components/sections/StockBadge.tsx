// components/sections/StockBadge.tsx
import type { Product, ProductVariant } from '@/lib/types';
import { getStockStatus, getVariantStockStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface StockBadgeProps {
  product: Product;
  variant?: ProductVariant | null; // ← added — when provided, stock status derived from variant
  className?: string;
}

/**
 * Displays a stock badge for a product or a selected variant.
 *
 * When a variant is provided:
 *   → Uses variant.onHand, variant.trackQuantity, variant.lowStockThreshold
 *   → Correct for products with variants — product-level stock is irrelevant
 *
 * When no variant is provided:
 *   → Falls back to product-level stock (trackStock, stockOnHand)
 *   → Correct for simple products with no variants
 *
 * Returns null when in_stock — no badge shown for available products.
 */
export function StockBadge({ product, variant = null, className = '' }: StockBadgeProps) {
  const status = variant ? getVariantStockStatus(variant) : getStockStatus(product);

  if (status === 'in_stock') return null;

  if (status === 'low_stock') {
    const remaining = variant ? variant.onHand : product.stockOnHand;
    return (
      <Badge variant="warning" className={className}>
        Only {remaining} left
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className={className}>
      Out of stock
    </Badge>
  );
}
