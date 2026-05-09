'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StoreData, CustomerProfile } from '@/lib/types';
import { resolveStorefrontLink } from '@/lib/navigation';
import { fetchCart, customerLogout } from '@/lib/storefront-client';
import { getFirstRegionBlock } from '@/lib/store-regions';
import { StoreLink } from './StoreLink';

interface NavProps {
  store: StoreData;
  slug: string;
  profile: CustomerProfile | null;
}

export function Nav({ store, slug, profile }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: cartData } = useQuery({
    queryKey: ['cart', slug],
    queryFn: () => fetchCart(slug),
    staleTime: 30 * 1000,
  });

  const isAuthenticated = profile !== null;
  const cartCount = cartData?.cart.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const announcementBlock = getFirstRegionBlock(store, 'announcement', 'announcement.message');
  const navigationBlock = getFirstRegionBlock(store, 'header', 'header.navigation');
  const announcement = announcementBlock?.data.text ?? store.themeSettings.announcement;
  const navigationLinks = navigationBlock?.data.links ?? [{ label: 'Shop', href: '/products' }];

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
    queryClient.invalidateQueries({ queryKey: ['cart', slug], refetchType: 'all' });
    window.location.href = '/';
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? '?');

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Announcement bar */}
      {announcement && announcementVisible && (
        <div className="relative bg-[var(--colour-primary)] py-2.5 px-10 text-center">
          <p className="text-xs font-medium tracking-wide text-white">{announcement}</p>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss announcement"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main header */}
      <header className="w-full border-b border-[var(--colour-primary)]/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 hover:opacity-70 transition-opacity" aria-label={store.name}>
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

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {navigationLinks.map((link) => {
                const resolved = resolveStorefrontLink(link);

                if (!resolved) return null;

                return (
                  <StoreLink
                    key={`${link.label}-${resolved.href}`}
                    href={resolved.href}
                    external={resolved.external}
                    className="text-sm font-medium text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </StoreLink>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                className="hidden md:flex items-center justify-center w-10 h-10 text-[var(--colour-primary)] opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Search"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                </svg>
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center justify-center w-10 h-10"
                    aria-label="Account menu"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--colour-primary)] text-white text-xs font-semibold">
                      {initials}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-[var(--radius-button)] border border-[var(--colour-primary)]/10 bg-white shadow-xl overflow-hidden z-50">
                      {profile && (
                        <div className="px-4 py-3 border-b border-[var(--colour-primary)]/10 bg-[var(--colour-primary)]/[0.02]">
                          {profile.name && (
                            <p className="text-xs font-semibold text-[var(--colour-primary)] truncate">{profile.name}</p>
                          )}
                          <p className="text-xs text-[var(--colour-primary)] opacity-40 truncate">{profile.email}</p>
                        </div>
                      )}
                      <Link
                        href="/account/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--colour-primary)] hover:bg-[var(--colour-primary)]/5 transition-colors"
                      >
                        <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        My Orders
                      </Link>
                      <Link
                        href="/account/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--colour-primary)] hover:bg-[var(--colour-primary)]/5 transition-colors"
                      >
                        <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        Account Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--colour-primary)] hover:bg-[var(--colour-primary)]/5 transition-colors border-t border-[var(--colour-primary)]/10"
                      >
                        <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/account/login"
                  className="hidden md:flex items-center justify-center w-10 h-10 text-[var(--colour-primary)] opacity-50 hover:opacity-100 transition-opacity"
                  aria-label="Sign in"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 text-[var(--colour-primary)] opacity-50 hover:opacity-100 transition-opacity"
                aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--colour-secondary)] text-white text-[10px] font-bold leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--colour-primary)]/10 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-0">
              {navigationLinks.map((link) => {
                const resolved = resolveStorefrontLink(link);

                if (!resolved) return null;

                return (
                  <StoreLink
                    key={`mobile-${link.label}-${resolved.href}`}
                    href={resolved.href}
                    external={resolved.external}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 text-sm font-medium text-[var(--colour-primary)] border-b border-[var(--colour-primary)]/8"
                  >
                    <>
                      {link.label}
                      <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </>
                  </StoreLink>
                );
              })}

              {!isAuthenticated ? (
                <>
                  <Link
                    href="/account/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 text-sm font-medium text-[var(--colour-primary)] border-b border-[var(--colour-primary)]/8"
                  >
                    Sign in
                    <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                  <Link
                    href="/account/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 text-sm font-medium text-[var(--colour-primary)]"
                  >
                    Create account
                    <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  {profile && (
                    <div className="py-3 border-b border-[var(--colour-primary)]/8">
                      <p className="text-xs text-[var(--colour-primary)] opacity-40">{profile.email}</p>
                    </div>
                  )}
                  <Link
                    href="/account/orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 text-sm font-medium text-[var(--colour-primary)] border-b border-[var(--colour-primary)]/8"
                  >
                    My Orders
                    <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 text-sm font-medium text-[var(--colour-primary)] border-b border-[var(--colour-primary)]/8"
                  >
                    Account Settings
                    <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center py-3.5 text-sm font-medium text-[var(--colour-primary)] opacity-60"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
