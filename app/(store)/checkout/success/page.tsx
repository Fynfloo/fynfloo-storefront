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

      // Endpoint unreachable or returned an error
      if (!data) {
        attemptsRef.current += 1;
        if (attemptsRef.current >= 4) {
          setPageStatus('failed');
          return;
        }
        setTimeout(poll, 2000);
        return;
      }

      // Webhook has fired — order is in DB
      if (data.status === 'confirmed') {
        setResult(data);
        setPageStatus('confirmed');

        // Clear cart token and invalidate cart cache — order is complete
        if (!clearedRef.current) {
          clearedRef.current = true;

          queryClient.setQueryData(['cart', slug], {
            cartToken: null,
            cart: {
              id: '',
              items: [],
              subtotal: 0,
              total: 0,
              discountCode: null,
              discountAmount: 0,
            },
          });

          queryClient.invalidateQueries({ queryKey: ['cart', slug] });
        }
        return;
      }

      // Webhook hasn't fired yet — retry
      attemptsRef.current += 1;
      if (attemptsRef.current >= 4) {
        // Webhook still hasn't fired after 4 attempts (~8 seconds).
        // Payment was confirmed by Stripe (we got customer data back).
        // Show a friendly "processing" state — not an error.
        setResult(data); // still has customerEmail/customerName from Stripe
        setPageStatus('processing_timeout');
        return;
      }

      setTimeout(poll, 2000);
    }

    poll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-lg">
          {/* Polling — waiting for webhook */}
          {pageStatus === 'polling' && (
            <div className="text-center space-y-4">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                Confirming your payment…
              </p>
            </div>
          )}

          {/* Confirmed — webhook fired, order in DB */}
          {pageStatus === 'confirmed' && result?.order && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-[var(--colour-primary)]">Order confirmed</h1>
                <p className="text-[var(--colour-primary)] opacity-60">
                  Thank you{result.customerName ? `, ${result.customerName}` : ''} — your order #
                  {result.order.orderNumber} is confirmed.
                </p>
                <p className="text-sm text-[var(--colour-primary)] opacity-40">
                  A confirmation email is on its way
                  {result.customerEmail ? ` to ${result.customerEmail}` : ''}.
                </p>
              </div>

              <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] overflow-hidden">
                <div className="p-4 border-b border-[var(--colour-primary)] border-opacity-10">
                  <h2 className="text-sm font-semibold text-[var(--colour-primary)]">
                    Order #{result.order.orderNumber}
                  </h2>
                </div>
                <div className="divide-y divide-[var(--colour-primary)] divide-opacity-10">
                  {result.order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--colour-primary)]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--colour-primary)] opacity-40">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--colour-primary)] whitespace-nowrap">
                        {formatPrice(item.pricePence * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-[var(--colour-primary)] border-opacity-10 flex justify-between">
                  <span className="text-sm font-semibold text-[var(--colour-primary)]">Total</span>
                  <span className="text-sm font-semibold text-[var(--colour-primary)]">
                    {formatPrice(result.order.totalPence, currency)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/account/orders"
                  className="flex-1 text-center py-3 text-sm font-medium border border-[var(--colour-primary)] border-opacity-20 rounded-[var(--radius-button)] text-[var(--colour-primary)] hover:opacity-70 transition-opacity"
                >
                  View all orders
                </Link>
                <Link
                  href="/products"
                  className="flex-1 text-center py-3 text-sm font-medium bg-[var(--colour-primary)] text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          )}

          {/* Processing timeout — payment confirmed by Stripe but webhook still in flight */}
          {pageStatus === 'processing_timeout' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Payment received</h1>
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                Your payment was confirmed. Your order is being processed and you will receive a
                confirmation email shortly
                {result?.customerEmail ? ` at ${result.customerEmail}` : ''}.
              </p>
              <Link
                href="/account/orders"
                className="inline-block text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                View your orders →
              </Link>
            </div>
          )}

          {/* Failed — no session_id or endpoint completely unreachable */}
          {pageStatus === 'failed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--colour-primary)]">
                Something went wrong
              </h1>
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                We could not confirm your payment. If you were charged, please contact us.
              </p>
              <Link
                href="/cart"
                className="inline-block text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
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
