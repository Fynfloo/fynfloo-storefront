'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerLogin, customerSignup } from '@/lib/storefront-client';
import { getCartToken } from '@/lib/cart';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

// We read slug from a data attribute set on the body by layout
function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

type Tab = 'signin' | 'create';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/account/orders';
  const slug = useSlug();

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for locked account
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

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setError('');

    const cartToken = getCartToken();
    const result = await customerLogin(slug, email, password, cartToken);

    if (result.ok) {
      router.replace(next);
      return;
    }

    if (result.status === 423 && result.error.lockedUntil) {
      setLockedUntil(new Date(result.error.lockedUntil));
      setError('Account locked due to too many failed attempts.');
    } else if (result.status === 401) {
      setError('Incorrect email or password.');
    } else {
      setError(result.error.error ?? 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    setError('');

    const result = await customerSignup(slug, email, password);

    if (result.ok) {
      setSuccessMessage(
        'Account created — check your email to confirm your address, then sign in.',
      );
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
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-sm">
          {/* Tab switcher */}
          <div className="flex border-b border-[var(--colour-primary)] border-opacity-10 mb-8">
            {(['signin', 'create'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setSuccessMessage('');
                }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors
                  ${
                    tab === t
                      ? 'text-[var(--colour-primary)] border-b-2 border-[var(--colour-primary)] -mb-px'
                      : 'text-[var(--colour-primary)] opacity-40 hover:opacity-70'
                  }`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-[var(--radius-button)] bg-green-50 border border-green-200">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-[var(--radius-button)] bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
              {lockedUntil && timeRemaining && (
                <p className="text-xs text-red-500 mt-1">Try again in {timeRemaining}</p>
              )}
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
              <div className="flex justify-end">
                <a
                  href="/account/forgot-password"
                  className="text-xs text-[var(--colour-primary)] opacity-50 hover:opacity-100 transition-opacity"
                >
                  Forgot password?
                </a>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={!!lockedUntil}
              >
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
              <p className="text-xs text-[var(--colour-primary)] opacity-40">
                We only need your email and password. Your delivery details are collected at
                checkout.
              </p>
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Create account
              </Button>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
