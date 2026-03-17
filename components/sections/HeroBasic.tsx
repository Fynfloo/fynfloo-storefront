// components/sections/HeroBasic.tsx
import Link from 'next/link';
import type { HeroBasicData } from '@/lib/types';

interface HeroBasicProps {
  data: HeroBasicData;
}

export function HeroBasic({ data }: HeroBasicProps) {
  const {
    eyebrow,
    title,
    subtitle,
    primaryCtaLabel,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
  } = data;

  return (
    <section className="relative w-full bg-[var(--colour-bg,#ffffff)] py-20 md:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--colour-secondary)]">
              {eyebrow}
            </p>
          )}

          <h1
            className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight
              text-[var(--colour-primary)] md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[var(--colour-primary)] opacity-70">
              {subtitle}
            </p>
          )}

          {(primaryCtaLabel || secondaryCtaLabel) && (
            <div className="flex flex-wrap items-center gap-4">
              {primaryCtaLabel && primaryCtaHref && (
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center px-8 py-3.5
                    text-sm font-medium uppercase tracking-widest
                    bg-[var(--colour-primary)] text-white
                    rounded-[var(--radius-button)]
                    transition-opacity duration-200 hover:opacity-80"
                >
                  {primaryCtaLabel}
                </Link>
              )}

              {secondaryCtaLabel && secondaryCtaHref && (
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center px-8 py-3.5
                    text-sm font-medium uppercase tracking-widest
                    border border-[var(--colour-primary)] text-[var(--colour-primary)]
                    rounded-[var(--radius-button)]
                    transition-colors duration-200
                    hover:bg-[var(--colour-primary)] hover:text-white"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
