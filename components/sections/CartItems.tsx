// components/sections/CartItems.tsx
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
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isPending: boolean;
  pendingProductId: string | null;
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
  pendingProductId,
}: CartItemsProps) {
  const { showThumbnails, showLineTotals } = data;
  const currency = useStoreCurrency();

  if (isLoading) {
    return (
      <Container>
        <div className="py-24 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      </Container>
    );
  }

  if (!cart || !cart.items.length) {
    return (
      <Container>
        <div className="py-24 text-center space-y-4">
          <p className="text-xl font-medium text-[var(--colour-primary)] opacity-40">
            Your cart is empty
          </p>
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
          >
            Continue shopping →
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-12">
        <h1
          className="mb-10 text-3xl md:text-4xl font-bold text-[var(--colour-primary)]"
          style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
        >
          Your cart
        </h1>
        <div className="divide-y divide-[var(--colour-primary)] divide-opacity-10">
          {cart.items.map((item: CartItem) => {
            const isUpdating = isPending && pendingProductId === item.productId;
            return (
              <div key={item.id} className="py-6 flex gap-4 md:gap-6">
                {showThumbnails && (
                  <Link href={`/products/${item.handle}`} className="flex-shrink-0">
                    <div className="relative w-20 h-24 md:w-24 md:h-32 overflow-hidden rounded-[var(--radius-button)] bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt ?? item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100" />
                      )}
                    </div>
                  </Link>
                )}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <Link
                      href={`/products/${item.handle}`}
                      className="text-sm font-medium text-[var(--colour-primary)] hover:opacity-70 transition-opacity"
                    >
                      {item.title}
                    </Link>
                    {showLineTotals && (
                      <span className="text-sm font-semibold text-[var(--colour-primary)] whitespace-nowrap">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--colour-primary)] opacity-50">
                    {formatPrice(item.price, currency)} each
                  </span>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-[var(--colour-primary)] border-opacity-20 rounded-[var(--radius-button)]">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            onRemove(item.productId);
                          } else {
                            onQuantityChange(item.productId, item.quantity - 1);
                          }
                        }}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-[var(--colour-primary)] hover:opacity-60 transition-opacity disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm text-[var(--colour-primary)]">
                        {isUpdating ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-[var(--colour-primary)] hover:opacity-60 transition-opacity disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.productId)}
                      disabled={isUpdating}
                      className="text-xs text-[var(--colour-primary)] opacity-40 hover:opacity-70 transition-opacity disabled:opacity-20"
                    >
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
