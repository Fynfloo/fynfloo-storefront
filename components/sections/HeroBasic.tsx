'use client';

import Image from 'next/image';
import { motion, SlideLeft, fadeUp, fadeUpSlow, staggerParent, staggerParentFast } from '@/components/ui/Motion';
import type { HeroBasicData } from '@/lib/types';
import { StoreLink } from '@/components/ui/StoreLink';
import { resolveActionTarget, resolveHref } from '@/lib/navigation';

interface HeroBasicProps {
  data: HeroBasicData;
}

export function HeroBasic({ data }: HeroBasicProps) {
  const {
    variant = 'split',
    eyebrow,
    title,
    subtitle,
    imageUrl,
    primaryCtaLabel,
    primaryCta,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCta,
    secondaryCtaHref,
  } = data;

  const primaryLink = resolveActionTarget(primaryCta) ?? resolveHref(primaryCtaHref);
  const secondaryLink = resolveActionTarget(secondaryCta) ?? resolveHref(secondaryCtaHref);

  if (variant === 'fullbleed') {
    return (
      <section className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

        <motion.div
          className="relative z-10 mx-auto max-w-4xl px-6 text-center"
          initial="hidden"
          animate="show"
          variants={staggerParentFast}
        >
          {eyebrow && (
            <motion.p
              className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
              variants={fadeUp}
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl"
            style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            variants={fadeUpSlow}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              className="mt-6 text-lg leading-relaxed text-white/70 max-w-xl mx-auto md:text-xl"
              variants={fadeUp}
            >
              {subtitle}
            </motion.p>
          )}

          {(primaryCtaLabel || secondaryCtaLabel) && (
            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
              variants={fadeUp}
            >
              {primaryCtaLabel && primaryLink && (
                <StoreLink
                  href={primaryLink.href}
                  external={primaryLink.external}
                  className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold bg-white text-gray-900 rounded-[var(--radius-button)] hover:bg-white/90 transition-colors"
                >
                  {primaryCtaLabel}
                </StoreLink>
              )}
              {secondaryCtaLabel && secondaryLink && (
                <StoreLink
                  href={secondaryLink.href}
                  external={secondaryLink.external}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                >
                  {secondaryCtaLabel}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </StoreLink>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-[1px] h-8 bg-white/30" />
        </div>
      </section>
    );
  }

  // ── Split layout (default) ──────────────────────────────────────────────────
  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[85vh] md:min-h-[90vh]">
          {/* Text block */}
          <motion.div
            className="flex flex-col justify-center py-20 md:py-24 md:pr-12 lg:pr-20"
            initial="hidden"
            animate="show"
            variants={staggerParent}
          >
            {eyebrow && (
              <motion.p
                className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--colour-secondary)]"
                variants={fadeUp}
              >
                {eyebrow}
              </motion.p>
            )}

            <motion.h1
              className="text-5xl font-bold leading-[1.05] tracking-tight text-[var(--colour-primary)] lg:text-6xl xl:text-7xl"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
              variants={fadeUpSlow}
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                className="mt-6 text-lg leading-relaxed text-[var(--colour-primary)] opacity-60 max-w-md"
                variants={fadeUp}
              >
                {subtitle}
              </motion.p>
            )}

            {(primaryCtaLabel || secondaryCtaLabel) && (
              <motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                variants={fadeUp}
              >
                {primaryCtaLabel && primaryLink && (
                  <StoreLink
                    href={primaryLink.href}
                    external={primaryLink.external}
                    className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold uppercase tracking-widest bg-[var(--colour-primary)] text-white rounded-[var(--radius-button)] hover:opacity-80 transition-opacity"
                  >
                    {primaryCtaLabel}
                  </StoreLink>
                )}
                {secondaryCtaLabel && secondaryLink && (
                  <StoreLink
                    href={secondaryLink.href}
                    external={secondaryLink.external}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--colour-primary)] hover:opacity-60 transition-opacity"
                  >
                    {secondaryCtaLabel}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </StoreLink>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Image block */}
          <SlideLeft className="relative hidden md:block">
            <div className="absolute inset-y-0 left-8 right-0 bg-[var(--colour-primary)]/[0.03] rounded-tl-[40px] rounded-bl-[40px]" />
            <div className="absolute inset-8 overflow-hidden rounded-[28px]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-end justify-start p-8">
                  <div className="space-y-1">
                    <div className="w-20 h-1 rounded-full bg-[var(--colour-primary)]/20" />
                    <div className="w-12 h-1 rounded-full bg-[var(--colour-primary)]/10" />
                  </div>
                </div>
              )}
            </div>
          </SlideLeft>
        </div>
      </div>

      {/* Mobile image strip */}
      {!imageUrl && (
        <div className="md:hidden h-64 bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
      {imageUrl && (
        <div className="md:hidden relative h-72 overflow-hidden">
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="100vw" priority />
        </div>
      )}
    </section>
  );
}
