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

  async function handleSave(e: React.FormEvent) {
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
    <div className="space-y-6">
      <div
        className="p-4 rounded-[var(--radius-button)] border border-[var(--colour-primary)] border-opacity-10"
        style={{ background: 'color-mix(in srgb, var(--colour-primary) 4%, transparent)' }}
      >
        <p className="text-xs opacity-50 mb-1" style={{ color: 'var(--colour-primary)' }}>
          Email
        </p>
        <p className="text-sm font-medium" style={{ color: 'var(--colour-primary)' }}>
          {initial.email}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[var(--radius-button)] bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {saved && (
        <div className="p-4 rounded-[var(--radius-button)] bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">Profile saved.</p>
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
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>

      <div className="pt-4 border-t border-[var(--colour-primary)] border-opacity-10">
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--colour-primary)] opacity-40 hover:opacity-70 transition-opacity"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
