'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const slug = useSlug();
  const currency = useStoreCurrency();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !id) return;
    getCustomerProfile(slug).then((p) => {
      if (!p) {
        router.replace('/account/login?next=/account/orders');
        return;
      }
      getCustomerOrders(slug).then((orders) => {
        const found = orders.find((o) => o.id === id);
        if (!found) {
          setNotFound(true);
        } else {
          setOrder(found);
        }
        setLoading(false);
      });
    });
  }, [slug, id, router]);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-lg text-center space-y-4">
            <p className="text-[var(--colour-primary)] opacity-50">Order not found.</p>
            <Link
              href="/account/orders"
              className="text-sm text-[var(--colour-secondary)] hover:opacity-70"
            >
              ← Back to orders
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header */}
          <div>
            <Link
              href="/account/orders"
              className="text-sm text-[var(--colour-primary)] opacity-40 hover:opacity-70 transition-opacity"
            >
              ← Orders
            </Link>
            <div className="flex items-center justify-between mt-4">
              <h1 className="text-2xl font-bold text-[var(--colour-primary)]">
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-[var(--colour-primary)] opacity-40 mt-1">
              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Items */}
          <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] overflow-hidden">
            <div className="p-4 border-b border-[var(--colour-primary)] border-opacity-10">
              <h2 className="text-sm font-semibold text-[var(--colour-primary)]">Items</h2>
            </div>
            <div className="divide-y divide-[var(--colour-primary)] divide-opacity-10">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--colour-primary)]">{item.title}</p>
                    <p className="text-xs text-[var(--colour-primary)] opacity-40">
                      Qty {item.quantity} × {formatPrice(item.price, currency)}
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

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] p-4 space-y-1">
              <h2 className="text-sm font-semibold text-[var(--colour-primary)] mb-3">
                Shipping address
              </h2>
              <p className="text-sm text-[var(--colour-primary)] opacity-70">
                {order.shippingAddress.name}
              </p>
              <p className="text-sm text-[var(--colour-primary)] opacity-70">
                {order.shippingAddress.line1}
              </p>
              {order.shippingAddress.line2 && (
                <p className="text-sm text-[var(--colour-primary)] opacity-70">
                  {order.shippingAddress.line2}
                </p>
              )}
              <p className="text-sm text-[var(--colour-primary)] opacity-70">
                {order.shippingAddress.city}, {order.shippingAddress.postcode}
              </p>
              <p className="text-sm text-[var(--colour-primary)] opacity-70">
                {order.shippingAddress.country}
              </p>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] p-4">
              <h2 className="text-sm font-semibold text-[var(--colour-primary)] mb-3">Tracking</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--colour-primary)] opacity-70 font-mono">
                  {order.trackingNumber}
                </span>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
                  >
                    Track package →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
