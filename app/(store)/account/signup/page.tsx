'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerSignup } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

export default function SignupPage() {
  const router = useRouter();
  const slug = useSlug();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setError('');

    const result = await customerSignup(slug, email, password);

    if (result.ok) {
      setDone(true);
    } else if (result.status === 409) {
      setError('An account with this email already exists.');
    } else {
      setError(result.error.error ?? 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Check your email</h1>
            <p className="text-sm text-[var(--colour-primary)] opacity-60">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
              account.
            </p>
            <button
              onClick={() => router.push('/account/login')}
              className="text-sm text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
            >
              Back to sign in →
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-bold text-[var(--colour-primary)] mb-8">Create account</h1>

          {error && (
            <div className="mb-6 p-4 rounded-[var(--radius-button)] bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-[var(--colour-primary)] opacity-40">
              We only need your email and password. Your delivery details are collected at checkout.
            </p>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--colour-primary)] opacity-50">
            Already have an account?{' '}
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
