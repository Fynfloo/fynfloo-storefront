'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmEmail } from '@/lib/storefront-client';
import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';

function useSlug(): string {
  if (typeof window === 'undefined') return '';
  return document.documentElement.dataset.slug ?? '';
}

type State = { status: 'pending' } | { status: 'success' } | { status: 'error'; message: string };

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const uid = searchParams.get('uid') ?? '';
  const slug = useSlug();

  // Derive initial state synchronously — no setState in effect body
  const [state, setState] = useState<State>(() => {
    if (!token || !uid) {
      return { status: 'error', message: 'Invalid confirmation link.' };
    }
    return { status: 'pending' };
  });

  useEffect(() => {
    // If we already know it's invalid, skip the API call
    if (state.status === 'error') return;
    if (!slug) return;

    confirmEmail(slug, token, uid).then((result) => {
      if (result.ok) {
        setState({ status: 'success' });
      } else {
        setState({ status: 'error', message: result.error });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]); // only re-run if slug changes (page mount)

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-sm text-center space-y-4">
          {state.status === 'pending' && (
            <>
              <Spinner size="md" className="mx-auto" />
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                Confirming your email…
              </p>
            </>
          )}

          {state.status === 'success' && (
            <>
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
              <h1 className="text-2xl font-bold text-[var(--colour-primary)]">Email confirmed</h1>
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                Your account is active. You can now sign in.
              </p>
              <a
                href="/account/login"
                className="inline-block mt-2 text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Sign in →
              </a>
            </>
          )}

          {state.status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--colour-primary)]">
                Confirmation failed
              </h1>
              <p className="text-sm text-[var(--colour-primary)] opacity-60">
                {state.message ||
                  'This link may have expired. Request a new one by signing up again.'}
              </p>
              <a
                href="/account/login"
                className="inline-block mt-2 text-sm font-medium text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Back to sign in →
              </a>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
