'use client';

import { useState } from 'react';
import { forgotPassword } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

export default function ForgotPasswordPage() {
  const slug = useSlug();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    await forgotPassword(slug, email);
    // Always show success — backend never reveals if email exists
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Check your email</h1>
            <p className="text-sm text-[var(--colour-primary)] opacity-60">
              If an account exists for <strong>{email}</strong>, we sent a reset link.
            </p>
            <a
              href="/account/login"
              className="inline-block text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
            >
              Back to sign in →
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
          <h1 className="text-2xl font-bold text-[var(--colour-primary)] mb-2">Reset password</h1>
          <p className="text-sm text-[var(--colour-primary)] opacity-60 mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

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
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--colour-primary)] opacity-50">
            Remember your password?{' '}
            <a
              href="/account/login"
              className="opacity-100 hover:opacity-70 transition-opacity underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
