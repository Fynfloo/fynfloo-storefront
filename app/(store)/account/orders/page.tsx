import { headers, cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatPrice } from '@/lib/types';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { fetchCustomerOrders, fetchCustomerProfile } from '@/lib/api';
import { AccountShell } from '@/components/ui/AccountShell';

export const metadata: Metadata = { title: 'My Orders' };

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PAID:               { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Paid' },
  PENDING:            { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Pending' },
  FAILED:             { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Failed' },
  FULFILLED:          { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Fulfilled' },
  CANCELLED:          { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Cancelled' },
  REFUNDED:           { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Refunded' },
  PARTIALLY_REFUNDED: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Part. refunded' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default async function OrdersPage() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const slug = headersList.get('x-store-slug') ?? '';
  const currency = headersList.get('x-store-currency') ?? 'GBP';
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? '';

  const [orders, profile] = await Promise.all([
    fetchCustomerOrders(slug, token),
    fetchCustomerProfile(slug, token),
  ]);

  return (
    <AccountShell profile={profile} activeTab="orders">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--colour-primary)]">My Orders</h1>
          <span className="text-sm text-[var(--colour-primary)]/40">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--colour-primary)]">No orders yet</p>
              <p className="text-xs text-[var(--colour-primary)]/40 mt-1">Your order history will appear here.</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
            >
              Start shopping
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {orders.map((order, i) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group ${
                  i < orders.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-[var(--colour-primary)]">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-xs text-[var(--colour-primary)]/40">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-semibold text-[var(--colour-primary)] w-20 text-right tabular-nums">
                    {formatPrice(order.totalPence, order.currency || currency)}
                  </span>
                  <svg className="w-4 h-4 text-[var(--colour-primary)]/20 group-hover:text-[var(--colour-primary)]/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
