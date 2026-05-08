'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Cart, CartSummaryData, CartResponse } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import {
  checkCustomerSession,
  initiateCheckout,
  applyDiscount,
  removeDiscount,
} from '@/lib/storefront-client';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CartSummaryProps {
  data: CartSummaryData;
  slug: string;
  cart: Cart | null;
}

function useStoreCurrency(): string {
  if (typeof window === 'undefined') return 'GBP';
  return document.documentElement.dataset.currency ?? 'GBP';
}

export function CartSummary({ data, slug, cart }: CartSummaryProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currency = useStoreCurrency();

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [discountPending, setDiscountPending] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function updateCartCache(updatedCart: Cart) {
    queryClient.setQueryData<CartResponse>(['cart', slug], (old) => {
      if (!old) return old;
      return { ...old, cart: updatedCart };
    });
  }

  async function handleApplyDiscount() {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setDiscountError('');
    setDiscountPending(true);
    try {
      const updatedCart = await applyDiscount(slug, code);
      updateCartCache(updatedCart);
      setCodeInput('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setDiscountError(e?.message ?? 'Invalid discount code');
      inputRef.current?.focus();
    } finally {
      setDiscountPending(false);
    }
  }

  async function handleRemoveDiscount() {
    setDiscountError('');
    setDiscountPending(true);
    try {
      const updatedCart = await removeDiscount(slug);
      updateCartCache(updatedCart);
    } catch {
      setDiscountError('Failed to remove discount — please try again');
    } finally {
      setDiscountPending(false);
    }
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      const isLoggedIn = await checkCustomerSession(slug);
      if (!isLoggedIn) {
        router.push('/account/login?next=/cart');
        return;
      }
      const url = await initiateCheckout(slug);
      if (url) {
        window.location.href = url;
      } else {
        setCheckoutError('Checkout is already in progress. Please wait a moment and try again.');
      }
    } finally {
      setCheckingOut(false);
    }
  }

  if (!cart?.items.length) return null;

  const hasDiscount = !!cart.discountCode;
  const showDiscountInput = data.showDiscountCode;

  return (
    <div className="pb-14">
      <Container>
        <div className="ml-auto max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-[var(--colour-primary)]">Order summary</h2>

            {/* Line items */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--colour-primary)]/50">Subtotal</span>
                <span className="font-medium text-[var(--colour-primary)]">{formatPrice(cart.subtotal, currency)}</span>
              </div>

              {hasDiscount && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[var(--colour-secondary)]/10 text-[var(--colour-secondary)] font-semibold">
                      {cart.discountCode}
                    </span>
                    <button
                      onClick={handleRemoveDiscount}
                      disabled={discountPending}
                      className="text-xs text-[var(--colour-primary)]/30 hover:text-red-500 transition-colors disabled:opacity-20"
                      aria-label="Remove discount"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="font-medium text-[var(--colour-secondary)]">
                    {cart.discountAmount > 0
                      ? `−${formatPrice(cart.discountAmount, currency)}`
                      : 'Free shipping'}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-[var(--colour-primary)]/50">Shipping</span>
                <span className="text-[var(--colour-primary)]/40 text-xs self-center">Calculated at checkout</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-base font-bold text-[var(--colour-primary)]">Total</span>
              <span className="text-lg font-bold text-[var(--colour-primary)] tabular-nums">
                {formatPrice(cart.total, currency)}
              </span>
            </div>

            {/* Discount code input */}
            {showDiscountInput && !hasDiscount && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.toUpperCase());
                      if (discountError) setDiscountError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyDiscount();
                    }}
                    placeholder="Discount code"
                    disabled={discountPending}
                    className="flex-1 h-10 px-3 text-sm rounded-[var(--radius-button)] border border-[var(--colour-primary)]/15 bg-gray-50 text-[var(--colour-primary)] placeholder-[var(--colour-primary)]/30 outline-none focus:ring-2 focus:ring-[var(--colour-primary)]/10 focus:border-[var(--colour-primary)]/30 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={discountPending || !codeInput.trim()}
                    className="h-10 px-4 text-sm font-semibold rounded-[var(--radius-button)] bg-[var(--colour-primary)]/6 text-[var(--colour-primary)] hover:bg-[var(--colour-primary)]/10 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {discountPending ? (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {discountError && (
                  <p className="text-xs text-red-500">{discountError}</p>
                )}
              </div>
            )}

            {/* Checkout error */}
            {checkoutError && (
              <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <p className="text-xs text-amber-700">{checkoutError}</p>
              </div>
            )}

            <Button onClick={handleCheckout} loading={checkingOut} size="lg" className="w-full">
              Proceed to checkout
            </Button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--colour-primary)]/30">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
