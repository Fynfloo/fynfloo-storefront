'use client';

import { useState } from 'react';
import { forgotPassword } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

export default function ForgotPasswordPage() {
  const slug = useSlug();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    await forgotPassword(slug, email);
    setDone(true);
    setLoading(false);
  }

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
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--colour-primary)]">Check your email</h1>
                <p className="text-sm text-[var(--colour-primary)]/60 mt-2 leading-relaxed">
                  If an account exists for <strong className="font-semibold text-[var(--colour-primary)]/80">{email}</strong>, we sent a reset link.
                </p>
              </div>
              <a
                href="/account/login"
                className="inline-block text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Back to sign in →
              </a>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Reset password</h1>
                <p className="mt-1.5 text-sm text-[var(--colour-primary)]/50 leading-relaxed">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <Button type="submit" size="lg" className="w-full !mt-6" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
