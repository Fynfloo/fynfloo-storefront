import Image from 'next/image';
import type { TextWithMediaData } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { SlideLeft, SlideRight } from '@/components/ui/Motion';

interface TextWithMediaProps {
  data: TextWithMediaData;
}

export function TextWithMedia({ data }: TextWithMediaProps) {
  const { eyebrow, title, body, imageUrl, imageAlt, imagePosition } = data;
  const isRight = imagePosition === 'right';

  return (
    <section className="py-16 md:py-28 bg-white overflow-hidden">
      <Container>
        <div className={`grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20 items-center`}>
          {/* Text */}
          <SlideRight className={`space-y-6 max-w-lg ${isRight ? '' : 'md:order-last'}`}>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--colour-secondary)]">
                {eyebrow}
              </p>
            )}
            <h2
              className="text-3xl md:text-4xl font-bold leading-[1.15] tracking-tight text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {title}
            </h2>
            <p className="text-base leading-relaxed text-[var(--colour-primary)] opacity-60">
              {body}
            </p>
          </SlideRight>

          {/* Image */}
          <SlideLeft className={`relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-[calc(var(--radius-button)*2)] bg-gray-100 ${isRight ? 'md:order-last' : ''}`}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-end p-8">
                <div className="space-y-2">
                  <div className="w-24 h-1 rounded-full bg-[var(--colour-primary)]/20" />
                  <div className="w-16 h-1 rounded-full bg-[var(--colour-primary)]/10" />
                </div>
              </div>
            )}
          </SlideLeft>
        </div>
      </Container>
    </section>
  );
}
