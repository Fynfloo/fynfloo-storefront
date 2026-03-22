'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerProfile, updateCustomerProfile, customerLogout } from '@/lib/storefront-client';
import type { CustomerProfile } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

export default function ProfilePage() {
  const router = useRouter();
  const slug = useSlug();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    getCustomerProfile(slug).then((p) => {
      if (!p) {
        router.replace('/account/login?next=/account/profile');
        return;
      }
      setProfile(p);
      setFirstName(p.firstName ?? '');
      setLastName(p.lastName ?? '');
      setLoading(false);
    });
  }, [slug, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    setError('');
    const updated = await updateCustomerProfile(slug, { firstName, lastName });
    if (updated) {
      setProfile(updated);
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

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">My account</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--colour-primary)] opacity-40 hover:opacity-70 transition-opacity"
            >
              Sign out
            </button>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-6 border-b border-[var(--colour-primary)] border-opacity-10 mb-8">
            {[
              { label: 'Profile', href: '/account/profile', active: true },
              { label: 'Orders', href: '/account/orders', active: false },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`pb-3 text-sm font-medium transition-colors
                  ${
                    item.active
                      ? 'text-[var(--colour-primary)] border-b-2 border-[var(--colour-primary)] -mb-px'
                      : 'text-[var(--colour-primary)] opacity-40 hover:opacity-70'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-[var(--radius-button)] bg-[var(--colour-primary)] bg-opacity-[0.03] border border-[var(--colour-primary)] border-opacity-10">
              <p className="text-xs text-[var(--colour-primary)] opacity-50 mb-1">Email</p>
              <p className="text-sm font-medium text-[var(--colour-primary)]">{profile?.email}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  autoComplete="given-name"
                />
                <Input
                  id="lastName"
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  autoComplete="family-name"
                />
              </div>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
