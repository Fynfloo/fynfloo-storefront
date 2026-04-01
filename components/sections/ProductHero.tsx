// components/sections/ProductHero.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductHeroData } from '@/lib/types';
import { CartResponse, formatPrice, getStockStatus } from '@/lib/types';
import { addToCart } from '@/lib/storefront-client';
import { StockBadge } from './StockBadge';
import { Button } from '@/components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';

interface ProductHeroProps {
  data: ProductHeroData;
  product: Product;
  slug: string;
  currency: string;
}

export function ProductHero({ data, product, slug, currency }: ProductHeroProps) {
  const { showBreadcrumbs, showBadges } = data;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const isOutOfStock = getStockStatus(product) === 'out_of_stock';
  const images = product.images ?? [];
  const currentImage = images[selectedImage];

  const router = useRouter();

  const queryClient = useQueryClient();

  async function handleAddToCart() {
    setAdding(true);
    try {
      const updatedCart = await addToCart(slug, product.id, quantity);
      if (updatedCart) {
        // Update cache directly so Nav count reflects immediately
        queryClient.setQueryData<CartResponse>(['cart', slug], (old) => ({
          ...old,
          cart: updatedCart,
        }));
        router.push('/cart');
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="py-12 md:py-16 bg-[var(--colour-bg,#ffffff)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showBreadcrumbs && (
          <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--colour-primary)] opacity-50">
            <Link href="/" className="hover:opacity-100 transition-opacity">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:opacity-100 transition-opacity">
              Products
            </Link>
            <span>/</span>
            <span className="opacity-100">{product.title}</span>
          </nav>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-button)] bg-gray-100">
              {currentImage ? (
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt ?? product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-[var(--radius-button)] bg-gray-100 transition-opacity
                      ${i === selectedImage ? 'ring-2 ring-[var(--colour-secondary)]' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt ?? `${product.title} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col space-y-6">
            {showBadges && (
              <div className="flex flex-wrap gap-2">
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wide bg-[var(--colour-secondary)] text-white rounded-[var(--radius-button)]">
                    Sale
                  </span>
                )}
                <StockBadge product={product} />
              </div>
            )}

            <h1
              className="text-3xl md:text-4xl font-bold leading-tight text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[var(--colour-primary)]">
                {formatPrice(product.price, currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice, currency)}
                </span>
              )}
            </div>

            {!isOutOfStock ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--colour-primary)] opacity-60">Quantity</span>
                  <div className="flex items-center border border-[var(--colour-primary)] border-opacity-20 rounded-[var(--radius-button)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-[var(--colour-primary)] hover:opacity-60 transition-opacity"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-[var(--colour-primary)]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-[var(--colour-primary)] hover:opacity-60 transition-opacity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Button onClick={handleAddToCart} loading={adding} size="lg" className="w-full">
                  Add to cart
                </Button>
              </div>
            ) : (
              <div className="py-4 text-center border border-[var(--colour-primary)] border-opacity-20 rounded-[var(--radius-button)]">
                <p className="text-sm text-[var(--colour-primary)] opacity-50">Out of stock</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
