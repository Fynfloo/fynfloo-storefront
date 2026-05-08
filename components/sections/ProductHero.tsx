// components/sections/ProductHero.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductHeroData, ProductVariant } from '@/lib/types';
import { CartResponse, formatPrice } from '@/lib/types';
import { addToCart } from '@/lib/storefront-client';
import { StockBadge } from './StockBadge';
import { VariantSelector } from './VariantSelector';
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
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const hasVariants = product.variants.length > 0;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!hasVariants) return null;
    if (Object.keys(selectedOptions).length !== product.options.length) return null;
    return (
      product.variants.find((v) =>
        product.options.every((opt) => v.options[opt.name] === selectedOptions[opt.name]),
      ) ?? null
    );
  }, [selectedOptions, product.variants, product.options, hasVariants]);

  const allOptionsSelected =
    !hasVariants || Object.keys(selectedOptions).length === product.options.length;

  function handleOptionChange(optionName: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    setAddError('');
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayCompareAtPrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;

  const isOutOfStock =
    selectedVariant !== null
      ? selectedVariant.trackQuantity &&
        !selectedVariant.allowOversell &&
        (selectedVariant.onHand ?? 0) <= 0
      : !hasVariants &&
        product.trackStock &&
        !product.allowOversell &&
        (product.stockOnHand ?? 0) <= 0;

  const maxQuantity =
    selectedVariant?.trackQuantity && selectedVariant.onHand !== null
      ? selectedVariant.onHand
      : product.trackStock && product.stockOnHand !== null
        ? product.stockOnHand
        : 99;

  const [quantity, setQuantity] = useState(1);

  function handleQuantityChange(newQty: number) {
    setQuantity(Math.min(Math.max(1, newQty), maxQuantity));
  }

  const addButtonLabel = !allOptionsSelected
    ? 'Select options'
    : isOutOfStock
      ? 'Out of stock'
      : adding
        ? 'Adding…'
        : 'Add to cart';

  const addButtonDisabled = !allOptionsSelected || isOutOfStock || adding;

  const images = product.images ?? [];
  const currentImage = images[selectedImage];

  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleAddToCart() {
    if (!allOptionsSelected) {
      setAddError('Please select all options before adding to cart');
      return;
    }
    if (isOutOfStock) return;
    setAdding(true);
    setAddError('');
    try {
      const updatedCart = await addToCart(slug, product.id, quantity, selectedVariant?.id ?? null);
      if (updatedCart) {
        queryClient.setQueryData<CartResponse>(['cart', slug], (old) => ({
          ...old,
          cart: updatedCart,
        }));
        router.push('/cart');
      } else {
        setAddError('Failed to add to cart — please try again');
      }
    } finally {
      setAdding(false);
    }
  }

  const discountPercent =
    displayCompareAtPrice && displayCompareAtPrice > displayPrice
      ? Math.round(((displayCompareAtPrice - displayPrice) / displayCompareAtPrice) * 100)
      : null;

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showBreadcrumbs && (
          <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--colour-primary)]/40">
            <Link href="/" className="hover:text-[var(--colour-primary)]/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[var(--colour-primary)]/70 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-[var(--colour-primary)]/70">{product.title}</span>
          </nav>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-20">
          {/* ── Image gallery ────────────────────────────────────────────── */}
          <div className={`relative flex gap-3 ${images.length > 1 ? 'flex-row-reverse' : ''}`}>
            {/* Main image */}
            <div className="relative flex-1 aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 min-w-0">
              {currentImage ? (
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt ?? product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 45vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Badge overlays */}
              {showBadges && (
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {discountPercent && (
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold bg-[var(--colour-secondary)] text-white rounded-full">
                      -{discountPercent}%
                    </span>
                  )}
                  {product.productType === 'DIGITAL' && (
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-[var(--colour-primary)] text-white rounded-full">
                      Digital
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Vertical thumbnail strip — desktop left column */}
            {images.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 w-[72px] flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 transition-all flex-shrink-0
                      ${i === selectedImage
                        ? 'ring-2 ring-[var(--colour-primary)] ring-offset-1'
                        : 'opacity-40 hover:opacity-80'
                      }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt ?? `${product.title} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile horizontal thumbnail strip */}
            {images.length > 1 && (
              <div className="sm:hidden absolute bottom-3 left-3 right-3 flex gap-1.5 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg bg-gray-50 transition-all
                      ${i === selectedImage ? 'ring-2 ring-white' : 'opacity-60'}`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ─────────────────────────────────────────────── */}
          <div className="flex flex-col space-y-6">
            {/* Stock badge */}
            {showBadges && (
              <div>
                <StockBadge product={product} variant={selectedVariant} />
              </div>
            )}

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[var(--colour-primary)]">
                {formatPrice(displayPrice, currency)}
              </span>
              {displayCompareAtPrice && displayCompareAtPrice > displayPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(displayCompareAtPrice, currency)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    Save {formatPrice(displayCompareAtPrice - displayPrice, currency)}
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--colour-primary)]/8" />

            {/* Variant selector */}
            {hasVariants && (
              <VariantSelector
                options={product.options}
                variants={product.variants}
                selectedOptions={selectedOptions}
                onOptionChange={handleOptionChange}
              />
            )}

            {/* Quantity */}
            {allOptionsSelected && !isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[var(--colour-primary)]/60">Qty</span>
                <div className="flex items-center rounded-xl border border-[var(--colour-primary)]/15 overflow-hidden bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-[var(--colour-primary)] hover:bg-gray-100 transition-colors disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-[var(--colour-primary)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity}
                    className="w-10 h-10 flex items-center justify-center text-[var(--colour-primary)] hover:bg-gray-100 transition-colors disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {maxQuantity < 10 && maxQuantity > 0 && (
                  <span className="text-xs text-[var(--colour-primary)]/40">
                    {maxQuantity} left
                  </span>
                )}
              </div>
            )}

            {/* Add to cart */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                loading={adding}
                disabled={addButtonDisabled}
                size="lg"
                className="w-full"
              >
                {addButtonLabel}
              </Button>

              {addError && (
                <p className="text-sm text-center text-red-500">{addError}</p>
              )}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 text-center">
                <svg className="w-4 h-4 text-[var(--colour-primary)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span className="text-[10px] font-medium text-[var(--colour-primary)]/50 leading-tight">Free delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 text-center">
                <svg className="w-4 h-4 text-[var(--colour-primary)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                <span className="text-[10px] font-medium text-[var(--colour-primary)]/50 leading-tight">Easy returns</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 text-center">
                <svg className="w-4 h-4 text-[var(--colour-primary)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-[10px] font-medium text-[var(--colour-primary)]/50 leading-tight">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
