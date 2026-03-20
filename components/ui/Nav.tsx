// components/ui/Nav.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { StoreData } from '@/lib/types';
import { fetchCart } from '@/lib/storefront-client';

interface NavProps {
  store: StoreData;
  slug: string;
}

export function Nav({ store, slug }: NavProps) {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchCart(slug)
      .then((res) => {
        if (cancelled) return;
        const count = res?.cart.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
        setCartCount(count);
      })
      .catch(() => {
        // silent — cart count is non-critical
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--colour-primary)] border-opacity-10 bg-[var(--colour-bg,#ffffff)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[var(--colour-primary)] hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
          >
            {store.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className="text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Shop
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              href="/account/login"
              className="text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity hidden md:block"
            >
              Account
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-[var(--colour-primary)] hover:opacity-70 transition-opacity"
              aria-label="Cart"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--colour-secondary)] text-white text-[10px] font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-[var(--colour-primary)] hover:opacity-70 transition-opacity"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[var(--colour-primary)] border-opacity-10 py-4 space-y-3">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Shop
            </Link>
            <Link
              href="/account/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
