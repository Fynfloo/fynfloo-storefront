import { headers, cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatPrice } from '@/lib/types';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { fetchCustomerOrder } from '@/lib/api';

export const metadata: Metadata = { title: 'Order' };

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PAID:               { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Paid' },
  PENDING:            { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Pending' },
  FAILED:             { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500',    label: 'Failed' },
  FULFILLED:          { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Fulfilled' },
  CANCELLED:          { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Cancelled' },
  REFUNDED:           { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Refunded' },
  PARTIALLY_REFUNDED: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Part. refunded' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
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
    <div className="min-h-screen bg-gray-50/60 py-10 md:py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Back */}
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)]/70 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to orders
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--colour-primary)]">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-[var(--colour-primary)]/40 mt-1">
                Placed{' '}
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Status banner */}
          {isDispatched ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 p-4">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">Your order has been dispatched</p>
                <p className="text-xs text-green-700/80 mt-0.5">
                  It&apos;s on its way to you.{order.courierName ? ` Courier: ${order.courierName}.` : ''}
                </p>
              </div>
            </div>
          ) : order.status === 'PAID' ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--colour-primary)]/[0.04] border border-[var(--colour-primary)]/10 p-4">
              <svg className="w-4 h-4 text-[var(--colour-primary)]/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[var(--colour-primary)]/60">Your order is being prepared.</p>
            </div>
          ) : null}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[var(--colour-primary)]">Items ordered</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                {item.imageUrl && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--colour-primary)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--colour-primary)]/40 mt-0.5">
                    Qty {item.quantity} · {formatPrice(item.pricePence, order.currency)} each
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--colour-primary)] tabular-nums flex-shrink-0">
                  {formatPrice(item.pricePence * item.quantity, order.currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--colour-primary)]">Total</span>
            <span className="text-sm font-semibold text-[var(--colour-primary)] tabular-nums">
              {formatPrice(order.totalPence, order.currency)}
            </span>
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[var(--colour-primary)] mb-4">Shipping address</h2>
            <address className="not-italic space-y-1">
              <p className="text-sm text-[var(--colour-primary)]/70">{order.shippingAddress.name}</p>
              <p className="text-sm text-[var(--colour-primary)]/70">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-sm text-[var(--colour-primary)]/70">{order.shippingAddress.line2}</p>
              )}
              <p className="text-sm text-[var(--colour-primary)]/70">
                {order.shippingAddress.city}, {order.shippingAddress.postcode}
              </p>
              <p className="text-sm text-[var(--colour-primary)]/70">{order.shippingAddress.country}</p>
            </address>
          </div>
        )}

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[var(--colour-primary)] mb-4">Tracking</h2>
            <dl className="space-y-2">
              {order.courierName && (
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-[var(--colour-primary)]/40">Courier</dt>
                  <dd className="text-sm text-[var(--colour-primary)]/80">{order.courierName}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-xs text-[var(--colour-primary)]/40">Tracking number</dt>
                <dd className="text-sm font-mono text-[var(--colour-primary)]/80">{order.trackingNumber}</dd>
              </div>
            </dl>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Track package
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
