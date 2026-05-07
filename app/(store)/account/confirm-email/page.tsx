'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmEmail } from '@/lib/storefront-client';
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

  const [state, setState] = useState<State>(() => {
    if (!token || !uid) return { status: 'error', message: 'Invalid confirmation link.' };
    return { status: 'pending' };
  });

  useEffect(() => {
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
  }, [slug]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-12 text-center">
          {state.status === 'pending' && (
            <div className="space-y-4">
              <Spinner size="md" className="mx-auto" />
              <p className="text-sm font-medium text-[var(--colour-primary)]/60">
                Confirming your email…
              </p>
            </div>
          )}

          {state.status === 'success' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--colour-primary)]">Email confirmed</h1>
                <p className="text-sm text-[var(--colour-primary)]/60 mt-2">
                  Your account is active. You can now sign in.
                </p>
              </div>
              <a
                href="/account/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Sign in →
              </a>
            </div>
          )}

          {state.status === 'error' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--colour-primary)]">Confirmation failed</h1>
                <p className="text-sm text-[var(--colour-primary)]/60 mt-2">
                  {state.message || 'This link may have expired. Sign up again to get a new one.'}
                </p>
              </div>
              <a
                href="/account/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--colour-secondary)] hover:opacity-70 transition-opacity"
              >
                Back to sign in →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
