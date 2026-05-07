'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Cart, CartItem, CartItemsData } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';

interface CartItemsProps {
  data: CartItemsData;
  slug: string;
  cart: Cart | null;
  isLoading: boolean;
  onQuantityChange: (productId: string, quantity: number, variantId: string | null) => void;
  onRemove: (productId: string, variantId: string | null) => void;
  isPending: boolean;
  pendingItemId: string | null;
}

function useStoreCurrency(): string {
  if (typeof window === 'undefined') return 'GBP';
  return document.documentElement.dataset.currency ?? 'GBP';
}

export function CartItems({
  data,
  cart,
  isLoading,
  onQuantityChange,
  onRemove,
  isPending,
  pendingItemId,
}: CartItemsProps) {
  const { showThumbnails, showLineTotals } = data;
  const currency = useStoreCurrency();

  if (isLoading) {
    return (
      <Container>
        <div className="py-32 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      </Container>
    );
  }

  if (!cart || !cart.items.length) {
    return (
      <Container>
        <div className="py-32 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--colour-primary)]">Your cart is empty</p>
            <p className="text-sm text-[var(--colour-primary)]/40 mt-1">Add something beautiful to get started.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--colour-primary)] text-white text-sm font-semibold rounded-[var(--radius-button)] hover:opacity-80 transition-opacity"
          >
            Browse products
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-10 md:py-14">
        <h1
          className="mb-8 text-3xl font-bold text-[var(--colour-primary)]"
          style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
        >
          Your cart
          <span className="ml-3 text-lg font-normal text-[var(--colour-primary)]/30">
            ({cart.items.reduce((s, i) => s + i.quantity, 0)})
          </span>
        </h1>

        <div className="space-y-3">
          {cart.items.map((item: CartItem) => {
            const itemKey = `${item.productId}:${item.variantId ?? ''}`;
            const isUpdating = isPending && pendingItemId === itemKey;

            return (
              <div
                key={item.id}
                className={`flex gap-4 md:gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-opacity ${isUpdating ? 'opacity-60' : ''}`}
              >
                {/* Thumbnail */}
                {showThumbnails && (
                  <Link href={`/products/${item.handle}`} className="flex-shrink-0">
                    <div className="relative w-20 h-24 md:w-24 md:h-28 overflow-hidden rounded-xl bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt ?? item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                )}

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.handle}`}
                        className="text-sm font-semibold text-[var(--colour-primary)] hover:opacity-70 transition-opacity line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      {item.variantTitle && (
                        <p className="text-xs text-[var(--colour-primary)]/40 mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-xs text-[var(--colour-primary)]/40 mt-0.5">
                        {formatPrice(item.price, currency)} each
                      </p>
                    </div>
                    {showLineTotals && (
                      <span className="text-sm font-bold text-[var(--colour-primary)] tabular-nums flex-shrink-0">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    )}
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 rounded-[var(--radius-button)] border border-[var(--colour-primary)]/15 bg-gray-50">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            onRemove(item.productId, item.variantId);
                          } else {
                            onQuantityChange(item.productId, item.quantity - 1, item.variantId);
                          }
                        }}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-[var(--colour-primary)] hover:bg-[var(--colour-primary)]/5 rounded-l-[var(--radius-button)] transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[var(--colour-primary)]">
                        {isUpdating ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => onQuantityChange(item.productId, item.quantity + 1, item.variantId)}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-[var(--colour-primary)] hover:bg-[var(--colour-primary)]/5 rounded-r-[var(--radius-button)] transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.productId, item.variantId)}
                      disabled={isUpdating}
                      className="text-xs text-[var(--colour-primary)]/30 hover:text-red-500 transition-colors disabled:opacity-20 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
