// components/sections/CartItems.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Cart, CartItem, CartItemsData } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { getCartToken } from '@/lib/cart';
import { Container } from '@/components/ui/Container';

interface CartItemsProps {
  data: CartItemsData;
  slug: string;
}

export function CartItems({ data, slug }: CartItemsProps) {
  const { showThumbnails, showLineTotals } = data;
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
      const cartToken = getCartToken();
      const res = await fetch(`${apiUrl}/api/storefront/cart`, {
        headers: {
          'X-Store-Slug': slug,
          ...(cartToken ? { 'X-Cart-Token': cartToken } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        if (data.cartToken) {
          const { setCartToken } = await import('@/lib/cart');
          setCartToken(data.cartToken);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) return removeItem(item);
    setUpdating(item.id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
      const cartToken = getCartToken();
      const res = await fetch(`${apiUrl}/api/storefront/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Slug': slug,
          ...(cartToken ? { 'X-Cart-Token': cartToken } : {}),
        },
        body: JSON.stringify({ productId: item.productId, quantity: newQuantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(item: CartItem) {
    setUpdating(item.id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
      const cartToken = getCartToken();
      const res = await fetch(`${apiUrl}/api/storefront/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Slug': slug,
          ...(cartToken ? { 'X-Cart-Token': cartToken } : {}),
        },
        body: JSON.stringify({ productId: item.productId, quantity: 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="py-24 flex items-center justify-center">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2
            border-[var(--colour-primary)] border-t-transparent"
          />
        </div>
      </Container>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Container>
        <div className="py-24 text-center space-y-4">
          <p className="text-xl font-medium text-[var(--colour-primary)] opacity-40">
            Your cart is empty
          </p>
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium
              text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
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
          {cart.items.map((item) => (
            <div key={item.id} className="py-6 flex gap-4 md:gap-6">
              {/* Thumbnail */}
              {showThumbnails && (
                <Link href={`/products/${item.handle}`} className="flex-shrink-0">
                  <div
                    className="relative w-20 h-24 md:w-24 md:h-32 overflow-hidden
                    rounded-[var(--radius-button)] bg-gray-100"
                  >
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

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <Link
                    href={`/products/${item.handle}`}
                    className="text-sm font-medium text-[var(--colour-primary)]
                      hover:opacity-70 transition-opacity"
                  >
                    {item.title}
                  </Link>
                  {showLineTotals && (
                    <span
                      className="text-sm font-semibold text-[var(--colour-primary)]
                      whitespace-nowrap"
                    >
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  )}
                </div>

                <span className="text-xs text-[var(--colour-primary)] opacity-50">
                  {formatPrice(item.price)} each
                </span>

                {/* Quantity controls */}
                <div className="mt-3 flex items-center justify-between">
                  <div
                    className="flex items-center border border-[var(--colour-primary)]
                    border-opacity-20 rounded-[var(--radius-button)]"
                  >
                    <button
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 flex items-center justify-center
                        text-[var(--colour-primary)] hover:opacity-60
                        transition-opacity disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm text-[var(--colour-primary)]">
                      {updating === item.id ? (
                        <span
                          className="inline-block h-3 w-3 animate-spin rounded-full
                          border border-current border-t-transparent"
                        />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 flex items-center justify-center
                        text-[var(--colour-primary)] hover:opacity-60
                        transition-opacity disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item)}
                    disabled={updating === item.id}
                    className="text-xs text-[var(--colour-primary)] opacity-40
                      hover:opacity-70 transition-opacity disabled:opacity-20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
