'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StoreData } from '@/lib/types';
import {
  fetchCart,
  checkCustomerSession,
  customerLogout,
  getCustomerProfile,
} from '@/lib/storefront-client';

interface NavProps {
  store: StoreData;
  slug: string;
}

export function Nav({ store, slug }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: cartData } = useQuery({
    queryKey: ['cart', slug],
    queryFn: () => fetchCart(slug),
    staleTime: 30 * 1000,
  });

  const { data: isAuthenticated } = useQuery({
    queryKey: ['auth', slug],
    queryFn: () => checkCustomerSession(slug),
    staleTime: 5 * 60 * 1000,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', slug],
    queryFn: () => getCustomerProfile(slug),
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const cartCount = cartData?.cart.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    await customerLogout(slug);
    queryClient.invalidateQueries({ queryKey: ['auth', slug], refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: ['profile', slug], refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: ['cart', slug], refetchType: 'all' });
    window.location.href = '/';
  }

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? '?');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--colour-primary)] border-opacity-10 bg-[var(--colour-bg,#ffffff)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-70 transition-opacity"
            aria-label={store.name}
          >
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name}
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            ) : (
              <span
                className="text-lg font-bold tracking-tight text-[var(--colour-primary)]"
                style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
              >
                {store.name}
              </span>
            )}
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
            {/* Auth — desktop */}
            {isAuthenticated === undefined ? (
              // Auth state unknown — placeholder to avoid layout shift
              <div className="hidden md:block w-8 h-8" />
            ) : isAuthenticated ? (
              // Logged in — avatar dropdown
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--colour-primary)] text-white text-xs font-semibold hover:opacity-80 transition-opacity"
                  aria-label="Account menu"
                >
                  {initials}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-[var(--radius-button)] border border-[var(--colour-primary)] border-opacity-10 bg-white shadow-lg py-1 z-50">
                    {profile && (
                      <div className="px-4 py-2 border-b border-[var(--colour-primary)] border-opacity-10">
                        {profile.name && (
                          <p className="text-xs font-medium text-[var(--colour-primary)] truncate">
                            {profile.name}
                          </p>
                        )}
                        <p className="text-xs text-[var(--colour-primary)] opacity-40 truncate">
                          {profile.email}
                        </p>
                      </div>
                    )}
                    <Link
                      href="/account/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[var(--colour-primary)] opacity-70 hover:opacity-100 hover:bg-[var(--colour-primary)]/5 transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[var(--colour-primary)] opacity-70 hover:opacity-100 hover:bg-[var(--colour-primary)]/5 transition-colors"
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--colour-primary)] opacity-70 hover:opacity-100 hover:bg-[var(--colour-primary)]/5 transition-colors border-t border-[var(--colour-primary)] border-opacity-10"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Logged out — login link
              <Link
                href="/account/login"
                className="text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity hidden md:block"
              >
                Login
              </Link>
            )}

            {/* Cart */}
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

            {/* Mobile menu button */}
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--colour-primary)] border-opacity-10 py-4 space-y-3">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Shop
            </Link>

            {/* Auth — mobile */}
            {isAuthenticated === undefined ? null : !isAuthenticated ? (
              <Link
                href="/account/login"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  href="/account/orders"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
                >
                  My Orders
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
                >
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
