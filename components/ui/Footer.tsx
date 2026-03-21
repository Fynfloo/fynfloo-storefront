// components/ui/Footer.tsx
import Link from 'next/link';
import type { StoreData } from '@/lib/types';

interface FooterProps {
  store: StoreData;
}

const PAYSTACK_CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR'];

export function Footer({ store }: FooterProps) {
  const year = new Date().getFullYear();
  const isPaystack = PAYSTACK_CURRENCIES.includes(store.currency);

  return (
    <footer
      className="border-t border-[var(--colour-primary)] border-opacity-10
      bg-[var(--colour-bg,#ffffff)] mt-auto"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3
              className="text-sm font-bold text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {store.name}
            </h3>
            <p className="text-xs text-[var(--colour-primary)] opacity-50 leading-relaxed">
              Powered by Fynfloo
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4
              className="text-xs uppercase tracking-widest font-medium
              text-[var(--colour-primary)] opacity-50"
            >
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-[var(--colour-primary)] opacity-60
                    hover:opacity-100 transition-opacity"
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-[var(--colour-primary)] opacity-60
                    hover:opacity-100 transition-opacity"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4
              className="text-xs uppercase tracking-widest font-medium
              text-[var(--colour-primary)] opacity-50"
            >
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/account/login"
                  className="text-sm text-[var(--colour-primary)] opacity-60
                    hover:opacity-100 transition-opacity"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/account/signup"
                  className="text-sm text-[var(--colour-primary)] opacity-60
                    hover:opacity-100 transition-opacity"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-sm text-[var(--colour-primary)] opacity-60
                    hover:opacity-100 transition-opacity"
                >
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t border-[var(--colour-primary)]
          border-opacity-10 flex flex-col md:flex-row items-center
          justify-between gap-4"
        >
          <p className="text-xs text-[var(--colour-primary)] opacity-40">
            © {year} {store.name}. All rights reserved.
          </p>
          <p className="text-xs text-[var(--colour-primary)] opacity-30">
            Secure payments by {isPaystack ? 'Paystack' : 'Stripe'}
          </p>
        </div>
      </div>
    </footer>
  );
}
