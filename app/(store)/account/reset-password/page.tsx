'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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

  const invalidLink = !token || !uid;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a
            href="/account/login"
            className="text-xs font-medium text-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)]/70 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10">
          {invalidLink ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--colour-primary)]">Invalid link</h1>
                <p className="text-sm text-[var(--colour-primary)]/60 mt-2">
                  This reset link is invalid or has expired.
                </p>
              </div>
              <a
                href="/account/forgot-password"
                className="inline-block text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Request a new one →
              </a>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Set new password</h1>
                <p className="mt-1.5 text-sm text-[var(--colour-primary)]/50">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
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
                <Button type="submit" size="lg" className="w-full !mt-6" loading={loading}>
                  Set password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
