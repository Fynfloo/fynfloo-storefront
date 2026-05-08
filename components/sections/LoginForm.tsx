'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { customerLogin, customerSignup } from '@/lib/storefront-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

type Tab = 'signin' | 'create';

interface LoginFormProps {
  next: string;
  initialTab?: Tab;
}

export function LoginForm({ next, initialTab = 'signin' }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = useSlug();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const diff = lockedUntil.getTime() - Date.now();
      if (diff <= 0) {
        setLockedUntil(null);
        setError('');
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  async function handleSignIn(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setError('');

    const result = await customerLogin(slug, email, password);

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ['cart', slug], refetchType: 'all' });
      router.replace(next);
      return;
    }

    if (result.status === 423 && result.error.lockedUntil) {
      setLockedUntil(new Date(result.error.lockedUntil));
      setError('Account locked due to too many failed attempts.');
    } else if (result.status === 403) {
      setError('Please confirm your email address before signing in. Check your inbox.');
    } else if (result.status === 401) {
      setError('Incorrect email or password.');
    } else {
      setError(result.error.error ?? 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  async function handleCreateAccount(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setError('');

    const result = await customerSignup(slug, email, password);

    if (result.ok) {
      setSuccessMessage('Account created — check your email to confirm, then sign in.');
      setTab('signin');
      setPassword('');
    } else if (result.status === 409) {
      setError('An account with this email already exists.');
    } else {
      setError(result.error.error ?? 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Back link */}
        <div className="text-center mb-8">
          <a
            href="/products"
            className="text-xs font-medium text-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)]/70 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Continue shopping
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8">
            {(['signin', 'create'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-[10px] transition-all ${
                  tab === t
                    ? 'bg-white shadow-sm text-[var(--colour-primary)]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Success banner */}
          {successMessage && (
            <div className="mb-6 flex gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <div>
                <p className="text-sm text-red-700">{error}</p>
                {lockedUntil && timeRemaining && (
                  <p className="text-xs text-red-500 mt-1">Try again in {timeRemaining}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
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
              <div>
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <div className="flex justify-end mt-1.5">
                  <a
                    href="/account/forgot-password"
                    className="text-xs text-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)]/70 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full !mt-6" loading={loading} disabled={!!lockedUntil}>
                Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-4">
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
          )}
        </div>
      </div>
    </div>
  );
}
