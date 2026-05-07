'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerProfile, customerLogout } from '@/lib/storefront-client';
import type { CustomerProfile } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

export function ProfileForm({ profile: initial }: { profile: CustomerProfile }) {
  const router = useRouter();
  const slug = useSlug();

  const [name, setName] = useState(initial.name ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    setError('');
    const updated = await updateCustomerProfile(slug, { name, phone });
    if (updated) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  }

  async function handleLogout() {
    if (!slug) return;
    await customerLogout(slug);
    router.replace('/account/login');
  }

  return (
    <div className="space-y-5">
      {/* Email card — read-only */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--colour-primary)]/40 mb-3">
          Account
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--colour-primary)]/40 mb-0.5">Email address</p>
            <p className="text-sm font-medium text-[var(--colour-primary)]">{initial.email}</p>
          </div>
          {initial.emailVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium flex-shrink-0">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium flex-shrink-0">
              Unverified
            </span>
          )}
        </div>
      </div>

      {/* Profile form card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--colour-primary)]/40 mb-5">
          Personal details
        </p>

        {error && (
          <div className="mb-5 flex gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {saved && (
          <div className="mb-5 flex gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700">Profile saved successfully.</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="name"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
          />
          <Input
            id="phone"
            label="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 900000"
            autoComplete="tel"
          />
          <div className="pt-1">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </div>

      {/* Danger zone / sign out */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--colour-primary)]/40 mb-4">
          Session
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--colour-primary)]">Sign out</p>
            <p className="text-xs text-[var(--colour-primary)]/40 mt-0.5">Sign out of your account on this device.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium px-4 py-2 rounded-[var(--radius-button)] border border-[var(--colour-primary)]/15 text-[var(--colour-primary)]/60 hover:text-[var(--colour-primary)] hover:border-[var(--colour-primary)]/30 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
