'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const uid = searchParams.get('uid') ?? '';
  const slug = useSlug();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!slug || !token || !uid) {
      setError('Invalid reset link.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await resetPassword(slug, token, uid, password);

    if (result.ok) {
      router.replace('/account/login');
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  if (!token || !uid) {
    return (
      <div className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-sm text-center space-y-4">
            <p className="text-sm text-red-600">Invalid or expired reset link.</p>
            <a
              href="/account/forgot-password"
              className="text-sm text-[var(--colour-secondary)] hover:opacity-70"
            >
              Request a new one →
            </a>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-bold text-[var(--colour-primary)] mb-8">Set new password</h1>

          {error && (
            <div className="mb-6 p-4 rounded-[var(--radius-button)] bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              type="password"
              label="New password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Input
              id="confirm"
              type="password"
              label="Confirm password"
              placeholder="Repeat new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Set password
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
