'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreLink } from '@/components/ui/StoreLink';
import { resolveActionTarget, resolveHref } from '@/lib/navigation';
import type { FeaturedCarouselData, Product } from '@/lib/types';
import { formatPrice } from '@/lib/types';

interface FeaturedCarouselProps {
  data: FeaturedCarouselData;
  products: Product[];
  currency: string;
}

export function FeaturedCarousel({ data, products, currency }: FeaturedCarouselProps) {
  const { heading, headingMuted, promoHeading, promoSubheading, promoCtaLabel, promoCta, promoCtaHref } = data;
  const scrollRef = useRef<HTMLDivElement>(null);
  const promoLink = resolveActionTarget(promoCta) ?? resolveHref(promoCtaHref);

  const hasPromo = Boolean(promoHeading);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector('[data-card]')?.clientWidth ?? 320;
    scrollRef.current.scrollBy({ left: dir === 'right' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' });
  }

  if (!products.length && !hasPromo) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-end justify-between mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--colour-primary)]"
            style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
          >
            {heading}
            {headingMuted && (
              <span className="text-[var(--colour-primary)]/30 font-normal"> {headingMuted}</span>
            )}
          </h2>

          {/* Arrow navigation — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--colour-primary)]/15 text-[var(--colour-primary)]/50 hover:border-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)] transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--colour-primary)]/15 text-[var(--colour-primary)]/50 hover:border-[var(--colour-primary)]/40 hover:text-[var(--colour-primary)] transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable row — breaks out of container on right */}
      <div className="pl-4 sm:pl-6 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        >
          {/* Promo card — dark, Apple Store style */}
          {hasPromo && (
            <div
              data-card
              className="relative flex-shrink-0 w-72 md:w-80 rounded-2xl bg-[var(--colour-primary)] overflow-hidden snap-start flex flex-col justify-between p-7"
              style={{ minHeight: 380 }}
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Featured
                </p>
                <h3
                  className="text-2xl font-bold leading-tight text-white"
                  style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
                >
                  {promoHeading}
                </h3>
                {promoSubheading && (
                  <p className="text-sm text-white/60 leading-relaxed">{promoSubheading}</p>
                )}
              </div>

              {promoCtaLabel && promoLink && (
                <StoreLink
                  href={promoLink.href}
                  external={promoLink.external}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors"
                >
                  {promoCtaLabel}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </StoreLink>
              )}

              {/* Decorative circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/[0.04]" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/[0.06]" />
            </div>
          )}

          {/* Product cards */}
          {products.map((product, i) => {
            const primaryImage = product.images?.[0];
            const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

            return (
              <Link
                key={product.id}
                data-card
                href={`/products/${product.handle}`}
                className="group relative flex-shrink-0 w-64 md:w-72 rounded-2xl border border-[var(--colour-primary)]/8 bg-white overflow-hidden snap-start flex flex-col hover:border-[var(--colour-primary)]/20 transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt ?? product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 256px, 288px"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {isOnSale && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[var(--colour-secondary)] text-white">
                      Sale
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-1 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--colour-secondary)]">
                    New
                  </p>
                  <h3 className="text-sm font-semibold text-[var(--colour-primary)] leading-snug group-hover:opacity-70 transition-opacity">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <span className="text-sm font-bold text-[var(--colour-primary)]">
                      {formatPrice(product.price, currency)}
                    </span>
                    {isOnSale && product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Spacer so last card doesn't flush to edge */}
          <div className="flex-shrink-0 w-4 md:w-8" />
        </div>
      </div>
    </section>
  );
}
