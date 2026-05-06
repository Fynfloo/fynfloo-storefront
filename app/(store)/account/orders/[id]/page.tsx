import { headers, cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatPrice } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { fetchCustomerOrder } from '@/lib/api';

export const metadata: Metadata = { title: 'Order' };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
    FULFILLED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
    REFUNDED: 'bg-orange-100 text-orange-700',
    PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')}
    </span>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const cookieStore = await cookies();

  const slug = headersList.get('x-store-slug') ?? '';
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? '';

  const order = await fetchCustomerOrder(slug, token, id);

  if (!order) notFound();

  const isDispatched = order.fulfilmentStatus === 'FULFILLED';

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

          {/* Status banner */}
          {isDispatched ? (
            <div className="flex items-start gap-3 rounded-[var(--radius-button)] border border-green-200 bg-green-50 p-4">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">Your order has been dispatched</p>
                <p className="text-xs text-green-700 mt-0.5 opacity-80">
                  It is on its way to you.{order.courierName ? ` Courier: ${order.courierName}.` : ''}
                </p>
              </div>
            </div>
          ) : order.status === 'PAID' ? (
            <div
              className="flex items-start gap-3 rounded-[var(--radius-button)] border border-[var(--colour-primary)] border-opacity-10 p-4"
              style={{ background: 'color-mix(in srgb, var(--colour-primary) 4%, transparent)' }}
            >
              <svg className="w-5 h-5 text-[var(--colour-primary)] opacity-40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                Your order is being prepared
              </p>
            </div>
          ) : null}

          {/* Items */}
          <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] overflow-hidden">
            <div className="p-4 border-b border-[var(--colour-primary)] border-opacity-10">
              <h2 className="text-sm font-semibold text-[var(--colour-primary)]">Items</h2>
            </div>
            <div className="divide-y divide-[var(--colour-primary)] divide-opacity-10">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--colour-primary)]">{item.name}</p>
                    <p className="text-xs text-[var(--colour-primary)] opacity-40">
                      Qty {item.quantity} × {formatPrice(item.pricePence, order.currency)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--colour-primary)] whitespace-nowrap">
                    {formatPrice(item.pricePence * item.quantity, order.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--colour-primary)] border-opacity-10 flex justify-between">
              <span className="text-sm font-semibold text-[var(--colour-primary)]">Total</span>
              <span className="text-sm font-semibold text-[var(--colour-primary)]">
                {formatPrice(order.totalPence, order.currency)}
              </span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] p-4 space-y-1">
              <h2 className="text-sm font-semibold text-[var(--colour-primary)] mb-3">
                Shipping address
              </h2>
              <p className="text-sm text-[var(--colour-primary)] opacity-70">{order.shippingAddress.name}</p>
              <p className="text-sm text-[var(--colour-primary)] opacity-70">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-sm text-[var(--colour-primary)] opacity-70">{order.shippingAddress.line2}</p>
              )}
              <p className="text-sm text-[var(--colour-primary)] opacity-70">
                {order.shippingAddress.city}, {order.shippingAddress.postcode}
              </p>
              <p className="text-sm text-[var(--colour-primary)] opacity-70">{order.shippingAddress.country}</p>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="border border-[var(--colour-primary)] border-opacity-10 rounded-[var(--radius-button)] p-4">
              <h2 className="text-sm font-semibold text-[var(--colour-primary)] mb-3">Tracking</h2>
              <div className="space-y-2">
                {order.courierName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--colour-primary)] opacity-50">Courier</span>
                    <span className="text-sm text-[var(--colour-primary)] opacity-70">{order.courierName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--colour-primary)] opacity-50">Tracking number</span>
                  <span className="text-sm text-[var(--colour-primary)] opacity-70 font-mono">{order.trackingNumber}</span>
                </div>
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
