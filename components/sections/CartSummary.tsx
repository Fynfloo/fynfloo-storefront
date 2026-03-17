// components/sections/CartSummary.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Cart, CartSummaryData } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { getCartToken } from '@/lib/cart';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CartSummaryProps {
  data: CartSummaryData;
  slug: string;
}

export function CartSummary({ data, slug }: CartSummaryProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

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
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
      const cartToken = getCartToken();

      // Check if logged in first
      const sessionRes = await fetch(`${apiUrl}/api/storefront/customer/profile`, {
        headers: {
          'X-Store-Slug': slug,
        },
        credentials: 'include',
      });

      if (!sessionRes.ok) {
        // Not logged in — redirect to login with next=/checkout
        router.push('/account/login?next=/checkout');
        return;
      }

      // Logged in — proceed to checkout
      const res = await fetch(`${apiUrl}/api/payments/checkout/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Slug': slug,
          ...(cartToken ? { 'X-Cart-Token': cartToken } : {}),
        },
        credentials: 'include',
      });

      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading || !cart?.items?.length) return null;

  return (
    <div className="bg-[var(--colour-bg,#ffffff)]">
      <Container>
        <div className="pb-16">
          <div
            className="ml-auto max-w-sm space-y-4 rounded-[var(--radius-button)]
            border border-[var(--colour-primary)] border-opacity-10 p-6"
          >
            <h2
              className="text-lg font-semibold text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              Order summary
            </h2>

            <div
              className="space-y-2 border-t border-[var(--colour-primary)]
              border-opacity-10 pt-4"
            >
              <div className="flex justify-between text-sm text-[var(--colour-primary)]">
                <span className="opacity-60">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--colour-primary)]">
                <span className="opacity-60">Shipping</span>
                <span className="opacity-60">Calculated at checkout</span>
              </div>
            </div>

            <div
              className="flex justify-between border-t border-[var(--colour-primary)]
              border-opacity-10 pt-4"
            >
              <span className="font-semibold text-[var(--colour-primary)]">Total</span>
              <span className="font-semibold text-[var(--colour-primary)]">
                {formatPrice(cart.total)}
              </span>
            </div>

            <Button onClick={handleCheckout} loading={checkingOut} size="lg" className="w-full">
              Proceed to checkout
            </Button>

            <p className="text-center text-xs text-[var(--colour-primary)] opacity-40">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
