'use client';

import { useState } from 'react';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
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
