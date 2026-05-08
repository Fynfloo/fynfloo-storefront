'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerSignup } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

interface SignupFormProps {
  next: string;
}

export function SignupForm({ next }: SignupFormProps) {
  const router = useRouter();
  const slug = useSlug();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Check your email</h1>
            <p className="text-sm text-[var(--colour-primary)]/60 leading-relaxed">
              We sent a confirmation link to <strong className="font-semibold text-[var(--colour-primary)]/80">{email}</strong>. Click it to activate your account.
            </p>
            <button
              onClick={() => router.push(`/account/login?next=${encodeURIComponent(next)}`)}
              className="text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
            >
              Back to sign in →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Back link */}
        <div className="text-center mb-8">
          <a
            href="/account/login"
            className="text-xs font-medium text-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)]/70 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Already have an account? Sign in
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Create account</h1>
            <p className="mt-1 text-sm text-[var(--colour-primary)]/50">Start shopping in seconds.</p>
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
            <p className="text-xs text-[var(--colour-primary)]/40 leading-relaxed">
              Your delivery details are collected at checkout.
            </p>
            <Button type="submit" size="lg" className="w-full !mt-2" loading={loading}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--colour-primary)]/40">
          By creating an account, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
