import Link from 'next/link';
import type { CustomerProfile } from '@/lib/types';

interface AccountShellProps {
  profile: CustomerProfile | null;
  activeTab: 'orders' | 'profile';
  children: React.ReactNode;
}

export function AccountShell({ profile, activeTab, children }: AccountShellProps) {
  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-gray-50/60 py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 xl:w-60 flex-shrink-0 space-y-3">
            {/* Profile card */}
            {profile && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--colour-primary)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    {profile.name && (
                      <p className="text-sm font-semibold text-[var(--colour-primary)] truncate">
                        {profile.name}
                      </p>
                    )}
                    <p className="text-xs text-[var(--colour-primary)]/40 truncate">{profile.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Link
                href="/account/orders"
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-gray-100 transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[var(--colour-primary)]/[0.04] text-[var(--colour-primary)]'
                    : 'text-[var(--colour-primary)]/50 hover:text-[var(--colour-primary)] hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Orders
              </Link>
              <Link
                href="/account/profile"
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[var(--colour-primary)]/[0.04] text-[var(--colour-primary)]'
                    : 'text-[var(--colour-primary)]/50 hover:text-[var(--colour-primary)] hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Profile
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
