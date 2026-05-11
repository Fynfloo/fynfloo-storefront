'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CategoryGridData } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { FadeUp, StaggerList, StaggerItem } from '@/components/ui/Motion';

interface CategoryGridProps {
  data: CategoryGridData;
}

export function CategoryGrid({ data }: CategoryGridProps) {
  const { heading, categories } = data;

  if (!categories?.length) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {heading && (
          <FadeUp className="mb-10 md:mb-12 flex items-end justify-between">
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {heading}
            </h2>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--colour-primary)] opacity-50 hover:opacity-100 transition-opacity"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </FadeUp>
        )}

        <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <StaggerItem key={cat.handle}>
              <Link
                href={`/collections/${cat.handle}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-button)] bg-gray-100"
              >
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-700 group-hover:scale-105" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                {/* Category label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p className="text-sm md:text-base font-semibold text-white leading-tight">{cat.label}</p>
                  <p className="mt-1 text-xs text-white/60 group-hover:text-white/90 transition-colors">
                    Shop now →
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </Container>
    </section>
  );
}
