// components/sections/Testimonials.tsx
import type { TestimonialsData } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { FadeUp, StaggerList, StaggerItem } from '@/components/ui/Motion';

interface TestimonialsProps {
  data: TestimonialsData;
}

function StarRow() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials({ data }: TestimonialsProps) {
  const { heading, testimonials } = data;

  if (!testimonials?.length) return null;

  return (
    <section className="py-20 md:py-28 bg-[var(--colour-primary)]/[0.02]">
      <Container>
        <FadeUp className="text-center mb-12 md:mb-16">
          {heading && (
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {heading}
            </h2>
          )}
          <div className="mt-4 flex items-center justify-center gap-2">
            <StarRow />
            <span className="text-sm text-[var(--colour-primary)]/50 font-medium">
              Loved by customers
            </span>
          </div>
        </FadeUp>

        <StaggerList className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <div className="relative flex flex-col justify-between bg-white rounded-2xl border border-[var(--colour-primary)]/8 shadow-sm p-7 h-full">
                <StarRow />

                <p className="mt-4 text-[var(--colour-primary)]/75 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--colour-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[var(--colour-primary)]/60">
                      {t.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--colour-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--colour-primary)]/40">Verified buyer</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </Container>
    </section>
  );
}
