// components/sections/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice, getStockStatus } from '@/lib/types';
import { StockBadge } from './StockBadge';

interface ProductCardProps {
  product: Product;
  slug: string;
  priority?: boolean;
}

export function ProductCard({ product, slug, priority = false }: ProductCardProps) {
  const stockStatus = getStockStatus(product);
  const isOutOfStock = stockStatus === 'out_of_stock';
  const primaryImage = product.images?.[0];
  const href = `https://${slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}/products/${product.handle}`;

  return (
    <Link
      href={`/products/${product.handle}`}
      className={`group block ${isOutOfStock ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-[var(--radius-button)] bg-gray-100
        aspect-[3/4]"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500
              group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center
            bg-gray-100 text-gray-300"
          >
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828
                0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2
                2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span
              className="inline-flex items-center px-2 py-0.5 text-xs font-medium
              uppercase tracking-wide bg-[var(--colour-secondary)] text-white
              rounded-[var(--radius-button)]"
            >
              Sale
            </span>
          )}
          <StockBadge product={product} />
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3
          className="text-sm font-medium text-[var(--colour-primary)]
          group-hover:opacity-70 transition-opacity duration-200"
        >
          {product.title}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--colour-primary)]">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
