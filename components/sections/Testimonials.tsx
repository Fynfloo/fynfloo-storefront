// components/sections/Testimonials.tsx
import type { TestimonialsData } from '@/lib/types';
import { Container } from '@/components/ui/Container';

interface TestimonialsProps {
  data: TestimonialsData;
}

export function Testimonials({ data }: TestimonialsProps) {
  const { heading, testimonials } = data;

  if (!testimonials?.length) return null;

  return (
    <section className="py-16 md:py-24 bg-[var(--colour-bg,#ffffff)]">
      <Container>
        {heading && (
          <h2
            className="mb-12 text-3xl md:text-4xl font-bold tracking-tight
              text-[var(--colour-primary)] text-center"
            style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
          >
            {heading}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-8 rounded-[var(--radius-button)]
                border border-[var(--colour-primary)] border-opacity-10
                bg-[var(--colour-primary)] bg-opacity-[0.02]"
            >
              {/* Quote mark */}
              <div>
                <svg
                  className="h-8 w-8 mb-4 text-[var(--colour-secondary)] opacity-60"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995
                    2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017
                    0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996
                    3.638-3.996 5.849h3.983v10h-9.983z"
                  />
                </svg>
                <p className="text-base leading-relaxed text-[var(--colour-primary)] opacity-80">
                  {t.quote}
                </p>
              </div>

              <p className="mt-6 text-sm font-medium text-[var(--colour-primary)] opacity-50">
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
