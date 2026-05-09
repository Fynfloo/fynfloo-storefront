import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchStoreData } from '@/lib/api';
import { FooterNewsletter } from '@/components/ui/FooterNewsletter';
import { getFirstRegionBlock } from '@/lib/store-regions';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const store = slug ? await fetchStoreData(slug) : null;

  return {
    title: store?.name ? `Coming Soon — ${store.name}` : 'Coming Soon',
    description: `${store?.name ?? 'This store'} is getting ready — check back soon.`,
    openGraph: {
      title: store?.name ? `Coming Soon — ${store.name}` : 'Coming Soon',
    },
  };
}

export default async function ComingSoonPage() {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const store = slug ? await fetchStoreData(slug) : null;
  const comingSoonBlock = store
    ? getFirstRegionBlock(store, 'comingSoon', 'comingSoon.message')
    : null;
  const eyebrow = comingSoonBlock?.data.eyebrow ?? store?.name ?? null;
  const title = comingSoonBlock?.data.title ?? 'Something exciting is coming';
  const body =
    comingSoonBlock?.data.body ??
    "We're putting the finishing touches on something special. Be the first to know when we launch.";
  const newsletterLabel = comingSoonBlock?.data.newsletterLabel ?? 'Get notified';
  const poweredByLabel = comingSoonBlock?.data.poweredByLabel ?? 'Powered by Fynfloo';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-24 text-center">
      {/* Decorative ring */}
      <div className="relative mb-10">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--colour-primary) 6%, transparent)' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--colour-primary) 10%, transparent)' }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: 'var(--colour-primary)', opacity: 0.6 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {eyebrow && (
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
          style={{ color: 'var(--colour-secondary)' }}
        >
          {eyebrow}
        </p>
      )}

      <h1
        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        style={{ color: 'var(--colour-primary)', fontFamily: 'var(--font-display, var(--font-body))' }}
      >
        {title}
      </h1>

      <p
        className="text-base md:text-lg max-w-md leading-relaxed mb-10"
        style={{ color: 'var(--colour-primary)', opacity: 0.5 }}
      >
        {body}
      </p>

      {/* Newsletter signup */}
      <div className="w-full max-w-sm">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-4"
          style={{ color: 'var(--colour-primary)', opacity: 0.35 }}
        >
          {newsletterLabel}
        </p>
        <FooterNewsletter />
      </div>

      {/* Bottom label */}
      <p
        className="mt-16 text-xs"
        style={{ color: 'var(--colour-primary)', opacity: 0.25 }}
      >
        {poweredByLabel}
      </p>
    </div>
  );
}
