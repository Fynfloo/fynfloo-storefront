'use client';

import type { StoreData } from '@/lib/types';
import { PreviewSelectableBox, useSiteEditorPreviewStore } from '@/components/editor/SiteEditorPreviewProvider';
import { FooterNewsletter } from './FooterNewsletter';
import { getFirstRegionBlock } from '@/lib/store-regions';

export function ComingSoonView({ store }: { store: StoreData | null }) {
  const previewStore = useSiteEditorPreviewStore(
    store ?? {
      id: '',
      name: '',
      slug: '',
      domain: null,
      businessType: '',
      templateKey: '',
      currency: 'GBP',
      status: 'ACTIVE',
      logoUrl: null,
      themeSettings: {
        primaryColour: '#111827',
        secondaryColour: '#f97316',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 6,
        buttonStyle: 'rounded',
      },
    },
  );

  const comingSoonBlock = store
    ? getFirstRegionBlock(previewStore, 'comingSoon', 'comingSoon.message')
    : null;
  const eyebrow = comingSoonBlock?.data.eyebrow ?? previewStore.name ?? null;
  const title = comingSoonBlock?.data.title ?? 'Something exciting is coming';
  const body =
    comingSoonBlock?.data.body ??
    "We're putting the finishing touches on something special. Be the first to know when we launch.";
  const newsletterLabel = comingSoonBlock?.data.newsletterLabel ?? 'Get notified';
  const poweredByLabel = comingSoonBlock?.data.poweredByLabel ?? 'Powered by Fynfloo';

  return (
    <PreviewSelectableBox nodeId="shared:comingSoon">
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-24 text-center">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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
          style={{
            color: 'var(--colour-primary)',
            fontFamily: 'var(--font-display, var(--font-body))',
          }}
        >
          {title}
        </h1>

        <p
          className="text-base md:text-lg max-w-md leading-relaxed mb-10"
          style={{ color: 'var(--colour-primary)', opacity: 0.5 }}
        >
          {body}
        </p>

        <div className="w-full max-w-sm">
          <p
            className="text-xs font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: 'var(--colour-primary)', opacity: 0.35 }}
          >
            {newsletterLabel}
          </p>
          <FooterNewsletter />
        </div>

        <p
          className="mt-16 text-xs"
          style={{ color: 'var(--colour-primary)', opacity: 0.25 }}
        >
          {poweredByLabel}
        </p>
      </div>
    </PreviewSelectableBox>
  );
}
