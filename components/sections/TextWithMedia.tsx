// components/sections/TextWithMedia.tsx
import Image from 'next/image';
import type { TextWithMediaData } from '@/lib/types';
import { Container } from '@/components/ui/Container';

interface TextWithMediaProps {
  data: TextWithMediaData;
}

export function TextWithMedia({ data }: TextWithMediaProps) {
  const { eyebrow, title, body, imageUrl, imageAlt, imagePosition } = data;
  const isRight = imagePosition === 'right';

  return (
    <section className="py-16 md:py-24 bg-[var(--colour-bg,#ffffff)]">
      <Container>
        <div
          className={`grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center
            ${isRight ? '' : 'md:[&>*:first-child]:order-last'}`}
        >
          {/* Text */}
          <div className="space-y-6">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--colour-secondary)]">
                {eyebrow}
              </p>
            )}
            <h2
              className="text-3xl md:text-4xl font-bold leading-tight
                text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {title}
            </h2>
            <p className="text-base leading-relaxed text-[var(--colour-primary)] opacity-70">
              {body}
            </p>
          </div>

          {/* Image */}
          <div
            className="relative aspect-[4/3] overflow-hidden
            rounded-[var(--radius-button)] bg-gray-100"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center
                bg-gray-100"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto" />
                  <p className="text-xs text-gray-400">Add an image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
