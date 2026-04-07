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

  // ── Variant state ───────────────────────────────────────────────────────────

  const hasVariants = product.variants.length > 0;

  // selectedOptions tracks the customer's current option selections
  // e.g. { "Size": "M", "Colour": "Black" }
  // Initialised empty — customer must actively select before adding to cart
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  /**
   * Finds the variant that exactly matches all currently selected options.
   * Returns null if not all options are selected yet.
   */
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!hasVariants) return null;
    if (Object.keys(selectedOptions).length !== product.options.length) return null;

    return (
      product.variants.find((v) =>
        product.options.every((opt) => v.options[opt.name] === selectedOptions[opt.name]),
      ) ?? null
    );
  }, [selectedOptions, product.variants, product.options, hasVariants]);

  // All options selected but no matching variant — should not happen with
  // a well-formed variant grid, but defensive fallback
  const allOptionsSelected =
    !hasVariants || Object.keys(selectedOptions).length === product.options.length;

  function handleOptionChange(optionName: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    setAddError('');
  }

  // ── Derived display values ──────────────────────────────────────────────────

  // Price: variant price when a variant is selected, base product price otherwise
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  // Compare at price: variant compareAtPrice when selected, else product compareAtPrice
  const displayCompareAtPrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;

  // Out of stock: derived from selected variant when present, else product-level
  const isOutOfStock =
    selectedVariant !== null
      ? selectedVariant.trackQuantity &&
        !selectedVariant.allowOversell &&
        (selectedVariant.onHand ?? 0) <= 0
      : !hasVariants &&
        product.trackStock &&
        !product.allowOversell &&
        (product.stockOnHand ?? 0) <= 0;

  // Quantity max: capped at variant stock when tracking, otherwise uncapped
  const maxQuantity =
    selectedVariant?.trackQuantity && selectedVariant.onHand !== null
      ? selectedVariant.onHand
      : product.trackStock && product.stockOnHand !== null
        ? product.stockOnHand
        : 99;

  const [quantity, setQuantity] = useState(1);

  // Reset quantity when variant changes to avoid exceeding new variant's stock
  function handleQuantityChange(newQty: number) {
    setQuantity(Math.min(Math.max(1, newQty), maxQuantity));
  }

  // ── Add to cart button state ────────────────────────────────────────────────

  /**
   * Add to cart button label logic:
   *   - No options selected yet    → "Select options"
   *   - Out of stock               → "Out of stock"
   *   - Ready                      → "Add to cart"
   */
  const addButtonLabel = !allOptionsSelected
    ? 'Select options'
    : isOutOfStock
      ? 'Out of stock'
      : adding
        ? 'Adding…'
        : 'Add to cart';

  const addButtonDisabled = !allOptionsSelected || isOutOfStock || adding;

  // ── Images ──────────────────────────────────────────────────────────────────

  const images = product.images ?? [];
  const currentImage = images[selectedImage];

  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleAddToCart() {
    if (!allOptionsSelected) {
      setAddError('Please select all options before adding to cart');
      return;
    }

    if (isOutOfStock) return;

    setAdding(true);
    setAddError('');

    try {
      const updatedCart = await addToCart(
        slug,
        product.id,
        quantity,
        selectedVariant?.id ?? null, // ← pass variantId
      );

      if (updatedCart) {
        // Update cache directly so Nav count reflects immediately
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

  // ── Render ──────────────────────────────────────────────────────────────────

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
          {/* ── Images ────────────────────────────────────────────────────── */}
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

          {/* ── Info ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col space-y-6">
            {/* Badges */}
            {showBadges && (
              <div className="flex flex-wrap gap-2">
                {displayCompareAtPrice && displayCompareAtPrice > displayPrice && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wide bg-[var(--colour-secondary)] text-white rounded-[var(--radius-button)]">
                    Sale
                  </span>
                )}
                {/* Digital download badge */}
                {product.productType === 'DIGITAL' && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wide bg-[var(--colour-primary)] text-[var(--colour-bg,#fff)] rounded-[var(--radius-button)]">
                    Digital download
                  </span>
                )}
                {/* Stock badge — shows variant stock when variant selected */}
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

            {/* Price — updates when variant selected */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[var(--colour-primary)]">
                {formatPrice(displayPrice, currency)}
              </span>
              {displayCompareAtPrice && displayCompareAtPrice > displayPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(displayCompareAtPrice, currency)}
                </span>
              )}
            </div>

            {/* Variant selector — only shown when product has variants */}
            {hasVariants && (
              <VariantSelector
                options={product.options}
                variants={product.variants}
                selectedOptions={selectedOptions}
                onOptionChange={handleOptionChange}
              />
            )}

            {/* Quantity + Add to cart */}
            <div className="space-y-4">
              {/* Quantity — only shown when not out of stock and all options selected */}
              {allOptionsSelected && !isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm"
                    style={{ color: 'var(--colour-primary)', opacity: 0.6 }}
                  >
                    Quantity
                  </span>
                  <div
                    className="flex items-center rounded-[var(--radius-button)]"
                    style={{ border: '1px solid var(--colour-primary)', opacity: 0.8 }}
                  >
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-[var(--colour-primary)] hover:opacity-60 transition-opacity"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-[var(--colour-primary)]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="w-10 h-10 flex items-center justify-center text-[var(--colour-primary)] hover:opacity-60 transition-opacity disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  {/* Stock hint when close to limit */}
                  {maxQuantity < 10 && maxQuantity > 0 && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--colour-primary)', opacity: 0.5 }}
                    >
                      {maxQuantity} available
                    </span>
                  )}
                </div>
              )}

              {/* Add to cart button */}
              <Button
                onClick={handleAddToCart}
                loading={adding}
                disabled={addButtonDisabled}
                size="lg"
                className="w-full"
              >
                {addButtonLabel}
              </Button>

              {/* Error message */}
              {addError && (
                <p
                  className="text-sm text-center"
                  style={{ color: 'var(--colour-error, #ef4444)' }}
                >
                  {addError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
