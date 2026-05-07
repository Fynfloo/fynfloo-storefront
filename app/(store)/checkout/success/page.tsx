'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrderBySessionId } from '@/lib/storefront-client';
import type { OrderBySessionResult } from '@/lib/storefront-client';
import { formatPrice } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

function useStoreCurrency(): string {
  if (typeof window === 'undefined') return 'GBP';
  return document.documentElement.dataset.currency ?? 'GBP';
}

type PageStatus = 'polling' | 'confirmed' | 'processing_timeout' | 'failed';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? '';
  const slug = useSlug();
  const currency = useStoreCurrency();
  const queryClient = useQueryClient();

  const [pageStatus, setPageStatus] = useState<PageStatus>(() =>
    !sessionId ? 'failed' : 'polling',
  );
  const [result, setResult] = useState<OrderBySessionResult | null>(null);
  const attemptsRef = useRef(0);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (pageStatus === 'failed') return;
    if (!slug) return;

    let cancelled = false;

    async function poll() {
      if (cancelled) return;

      const data = await getOrderBySessionId(slug, sessionId);

      if (cancelled) return;

      if (!data) {
        attemptsRef.current += 1;
        if (attemptsRef.current >= 4) {
          setPageStatus('failed');
          return;
        }
        setTimeout(poll, 2000);
        return;
      }

      if (data.status === 'confirmed') {
        setResult(data);
        setPageStatus('confirmed');

        if (!clearedRef.current) {
          clearedRef.current = true;
          queryClient.setQueryData(['cart', slug], {
            cartToken: null,
            cart: { id: '', items: [], subtotal: 0, total: 0, discountCode: null, discountAmount: 0 },
          });
          queryClient.invalidateQueries({ queryKey: ['cart', slug] });
        }
        return;
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= 4) {
        setResult(data);
        setPageStatus('processing_timeout');
        return;
      }
      setTimeout(poll, 2000);
    }

    poll();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 flex items-center justify-center py-12 px-4">
      <Container>
        <div className="mx-auto max-w-lg">
          {/* Polling */}
          {pageStatus === 'polling' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center space-y-4">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-sm font-medium text-[var(--colour-primary)]/60">Confirming your payment…</p>
            </div>
          )}

          {/* Confirmed */}
          {pageStatus === 'confirmed' && result?.order && (
            <div className="space-y-4">
              {/* Success header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Order confirmed!</h1>
                  <p className="text-sm text-[var(--colour-primary)]/60 mt-2">
                    Thank you{result.customerName ? `, ${result.customerName}` : ''} — your order #{result.order.orderNumber} is on its way.
                  </p>
                </div>
                {result.customerEmail && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs text-[var(--colour-primary)]/50">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Confirmation sent to {result.customerEmail}
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-[var(--colour-primary)]">
                    Order #{result.order.orderNumber}
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--colour-primary)]">{item.name}</p>
                        <p className="text-xs text-[var(--colour-primary)]/40 mt-0.5">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--colour-primary)] tabular-nums flex-shrink-0">
                        {formatPrice(item.pricePence * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--colour-primary)]">Total</span>
                  <span className="text-base font-bold text-[var(--colour-primary)] tabular-nums">
                    {formatPrice(result.order.totalPence, currency)}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/account/orders"
                  className="flex-1 text-center py-3 px-4 text-sm font-semibold border border-[var(--colour-primary)]/15 rounded-[var(--radius-button)] text-[var(--colour-primary)] hover:bg-gray-50 transition-colors"
                >
                  View all orders
                </Link>
                <Link
                  href="/products"
                  className="flex-1 text-center py-3 px-4 text-sm font-semibold bg-[var(--colour-primary)] text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          )}

          {/* Processing timeout */}
          {pageStatus === 'processing_timeout' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Payment received</h1>
                <p className="text-sm text-[var(--colour-primary)]/60 mt-2">
                  Your payment was confirmed. Your order is being processed and you&apos;ll receive a confirmation email shortly
                  {result?.customerEmail ? ` at ${result.customerEmail}` : ''}.
                </p>
              </div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                View your orders →
              </Link>
            </div>
          )}

          {/* Failed */}
          {pageStatus === 'failed' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Something went wrong</h1>
                <p className="text-sm text-[var(--colour-primary)]/60 mt-2">
                  We could not confirm your payment. If you were charged, please contact us.
                </p>
              </div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Return to cart →
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
