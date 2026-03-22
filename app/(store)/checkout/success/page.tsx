'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrderBySessionId } from '@/lib/storefront-client';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

function useStoreCurrency(): string {
  if (typeof window === 'undefined') return 'GBP';
  return document.documentElement.dataset.currency ?? 'GBP';
}

type Status = 'polling' | 'paid' | 'failed';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? '';
  const slug = useSlug();
  const currency = useStoreCurrency();

  // Derive initial status synchronously — no setState in effect body
  const [status, setStatus] = useState<Status>(() => (!sessionId ? 'failed' : 'polling'));
  const [order, setOrder] = useState<Order | null>(null);

  // Use a ref for attempt count — doesn't need to trigger renders
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (status === 'failed') return; // no sessionId — already failed
    if (!slug) return;

    let cancelled = false;

    async function poll() {
      if (cancelled) return;

      const result = await getOrderBySessionId(slug, sessionId);

      if (cancelled) return;

      if (result && result.status === 'PAID') {
        setOrder(result);
        setStatus('paid');
        return;
      }

      attemptsRef.current += 1;

      if (attemptsRef.current >= 10) {
        setStatus('failed');
        return;
      }

      setTimeout(poll, 2000);
    }

    poll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]); // slug is the only thing that changes on mount

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-lg">
          {status === 'polling' && (
            <div className="text-center space-y-4">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                Confirming your payment…
              </p>
            </div>
          )}

          {status === 'paid' && order && (
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
                  Thank you — your order #{order.orderNumber} is confirmed.
                </p>
                <p className="text-sm text-[var(--colour-primary)] opacity-40">
                  A confirmation email is on its way.
                </p>
              </div>

              <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] overflow-hidden">
                <div className="p-4 border-b border-[var(--colour-primary)] border-opacity-10">
                  <h2 className="text-sm font-semibold text-[var(--colour-primary)]">
                    Order #{order.orderNumber}
                  </h2>
                </div>
                <div className="divide-y divide-[var(--colour-primary)] divide-opacity-10">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--colour-primary)]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[var(--colour-primary)] opacity-40">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--colour-primary)] whitespace-nowrap">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-[var(--colour-primary)] border-opacity-10 flex justify-between">
                  <span className="text-sm font-semibold text-[var(--colour-primary)]">Total</span>
                  <span className="text-sm font-semibold text-[var(--colour-primary)]">
                    {formatPrice(order.total, currency)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/account/orders"
                  className="flex-1 text-center py-3 text-sm font-medium border border-[var(--colour-primary)] border-opacity-20 rounded-[var(--radius-button)] text-[var(--colour-primary)] hover:opacity-70 transition-opacity"
                >
                  View all orders
                </a>
                <Link
                  href="/products"
                  className="flex-1 text-center py-3 text-sm font-medium bg-[var(--colour-primary)] text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
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
              <a
                href="/cart"
                className="inline-block text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Return to cart →
              </a>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
