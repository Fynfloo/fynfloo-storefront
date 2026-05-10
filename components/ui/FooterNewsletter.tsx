'use client';

import { useState, useSyncExternalStore } from 'react';

function subscribeToHydrationState() {
  return () => undefined;
}

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isMounted = useSyncExternalStore(
    subscribeToHydrationState,
    () => true,
    () => false,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-white/80">
        Thanks for subscribing! We&apos;ll be in touch soon.
      </p>
    );
  }

  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        suppressHydrationWarning
        className="flex max-w-sm flex-col gap-3 sm:flex-row"
      >
        <div className="h-[42px] flex-1 rounded-[var(--radius-button)] border border-white/20 bg-white/10" />
        <div className="h-[42px] w-full rounded-[var(--radius-button)] bg-white sm:w-[120px]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm">
      <input
        type="email"
        name="footer-newsletter-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        autoComplete="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
      />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-[var(--radius-button)] bg-white text-[var(--colour-primary)] text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
