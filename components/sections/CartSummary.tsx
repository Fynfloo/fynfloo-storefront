// components/sections/CartSummary.tsx
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

  // ── Discount state ────────────────────────────────────────────────────────────
  const [codeInput, setCodeInput] = useState('');
  const [discountPending, setDiscountPending] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function updateCartCache(updatedCart: Cart) {
    queryClient.setQueryData<CartResponse>(['cart', slug], (old) => {
      if (!old) return old;
      return { ...old, cart: updatedCart };
    });
  }

  // ── Apply discount ────────────────────────────────────────────────────────────

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

  // ── Remove discount ───────────────────────────────────────────────────────────

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

  // ── Checkout ──────────────────────────────────────────────────────────────────

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      const isLoggedIn = await checkCustomerSession(slug);
      if (!isLoggedIn) {
        router.push('/account/login?next=/checkout');
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

            {/* Line items */}
            <div className="space-y-2 border-t border-[var(--colour-primary)] border-opacity-10 pt-4">
              <div className="flex justify-between text-sm text-[var(--colour-primary)]">
                <span className="opacity-60">Subtotal</span>
                <span>{formatPrice(cart.subtotal, currency)}</span>
              </div>

              {/* Applied discount line */}
              {hasDiscount && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--colour-secondary)',
                        color: '#fff',
                        opacity: 0.85,
                      }}
                    >
                      {cart.discountCode}
                    </span>
                    <button
                      onClick={handleRemoveDiscount}
                      disabled={discountPending}
                      className="text-xs opacity-40 hover:opacity-70 transition-opacity disabled:opacity-20"
                      style={{ color: 'var(--colour-primary)' }}
                      aria-label="Remove discount code"
                    >
                      ✕
                    </button>
                  </div>
                  <span style={{ color: 'var(--colour-secondary)' }}>
                    {cart.discountAmount > 0
                      ? `−${formatPrice(cart.discountAmount, currency)}`
                      : 'Free shipping'}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm text-[var(--colour-primary)]">
                <span className="opacity-60">Shipping</span>
                <span className="opacity-60">Calculated at checkout</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between border-t border-[var(--colour-primary)] border-opacity-10 pt-4">
              <span className="font-semibold text-[var(--colour-primary)]">Total</span>
              <span className="font-semibold text-[var(--colour-primary)]">
                {formatPrice(cart.total, currency)}
              </span>
            </div>

            {/* Discount code input — shown when no code applied */}
            {showDiscountInput && !hasDiscount && (
              <div className="space-y-2 border-t border-[var(--colour-primary)] border-opacity-10 pt-4">
                <p className="text-xs font-medium text-[var(--colour-primary)] opacity-60">
                  Discount code
                </p>
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
                    placeholder="Enter code"
                    disabled={discountPending}
                    className="flex-1 h-9 px-3 text-sm rounded-[var(--radius-button)] border outline-none transition-colors disabled:opacity-50"
                    style={{
                      background: 'transparent',
                      borderColor: discountError
                        ? '#ef4444'
                        : 'color-mix(in srgb, var(--colour-primary) 20%, transparent)',
                      color: 'var(--colour-primary)',
                    }}
                    onFocus={(e) => {
                      if (!discountError) {
                        e.currentTarget.style.borderColor =
                          'color-mix(in srgb, var(--colour-primary) 50%, transparent)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!discountError) {
                        e.currentTarget.style.borderColor =
                          'color-mix(in srgb, var(--colour-primary) 20%, transparent)';
                      }
                    }}
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={discountPending || !codeInput.trim()}
                    className="h-9 px-3 text-sm font-medium rounded-[var(--radius-button)] transition-opacity disabled:opacity-40 whitespace-nowrap"
                    style={{
                      background: 'color-mix(in srgb, var(--colour-primary) 8%, transparent)',
                      color: 'var(--colour-primary)',
                    }}
                  >
                    {discountPending ? (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {/* Error message */}
                {discountError && (
                  <p className="text-xs" style={{ color: '#ef4444' }}>
                    {discountError}
                  </p>
                )}
              </div>
            )}

            {/* Checkout error */}
            {checkoutError && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-[var(--radius-button)] px-3 py-2">
                {checkoutError}
              </p>
            )}

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
