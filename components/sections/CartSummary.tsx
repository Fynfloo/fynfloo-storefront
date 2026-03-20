// components/sections/CartSummary.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Cart, CartSummaryData } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { checkCustomerSession, initiateCheckout } from '@/lib/storefront-client';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CartSummaryProps {
  data: CartSummaryData;
  slug: string;
  cart: Cart | null;
}

export function CartSummary({ data, slug, cart }: CartSummaryProps) {
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const isLoggedIn = await checkCustomerSession(slug);
      if (!isLoggedIn) {
        router.push('/account/login?next=/checkout');
        return;
      }
      const url = await initiateCheckout(slug);
      if (url) window.location.href = url;
    } finally {
      setCheckingOut(false);
    }
  }

  if (!cart?.items.length) return null;

  return (
    <div className="bg-[var(--colour-bg,#ffffff)]">
      <Container>
        <div className="pb-16">
          <div className="ml-auto max-w-sm space-y-4 rounded-[var(--radius-button)] border border-[var(--colour-primary)] border-opacity-10 p-6">
            <h2
              className="text-lg font-semibold text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              Order summary
            </h2>
            <div className="space-y-2 border-t border-[var(--colour-primary)] border-opacity-10 pt-4">
              <div className="flex justify-between text-sm text-[var(--colour-primary)]">
                <span className="opacity-60">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--colour-primary)]">
                <span className="opacity-60">Shipping</span>
                <span className="opacity-60">Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-[var(--colour-primary)] border-opacity-10 pt-4">
              <span className="font-semibold text-[var(--colour-primary)]">Total</span>
              <span className="font-semibold text-[var(--colour-primary)]">
                {formatPrice(cart.total)}
              </span>
            </div>
            <Button onClick={handleCheckout} loading={checkingOut} size="lg" className="w-full">
              Proceed to checkout
            </Button>
            <p className="text-center text-xs text-[var(--colour-primary)] opacity-40">
              Secure checkout
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
