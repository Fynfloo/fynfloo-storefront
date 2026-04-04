'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerOrders, getCustomerProfile } from '@/lib/storefront-client';
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
    FULFILLED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function OrdersPage() {
  const slug = useSlug();
  const currency = useStoreCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    getCustomerOrders(slug).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">My account</h1>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-6 border-b border-[var(--colour-primary)] border-opacity-10 mb-8">
            {[
              { label: 'Profile', href: '/account/profile', active: false },
              { label: 'Orders', href: '/account/orders', active: true },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`pb-3 text-sm font-medium transition-colors
                  ${
                    item.active
                      ? 'text-[var(--colour-primary)] border-b-2 border-[var(--colour-primary)] -mb-px'
                      : 'text-[var(--colour-primary)] opacity-40 hover:opacity-70'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-[var(--colour-primary)] opacity-40">No orders yet</p>
              <Link
                href="/products"
                className="text-sm text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] p-4 hover:border-opacity-30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--colour-primary)]">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-[var(--colour-primary)] opacity-40">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-semibold text-[var(--colour-primary)]">
                        {formatPrice(order.totalPence, order.currency || currency)}
                      </span>
                      <svg
                        className="w-4 h-4 text-[var(--colour-primary)] opacity-30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
