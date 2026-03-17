// components/sections/ProductSpecs.tsx
import type { Product, ProductSpecsData } from '@/lib/types';
import { Container } from '@/components/ui/Container';

interface ProductSpecsProps {
  data: ProductSpecsData;
  product: Product;
}

export function ProductSpecs({ data, product }: ProductSpecsProps) {
  const { showDescription } = data;

  if (!showDescription || !product.description) return null;

  return (
    <section className="py-12 md:py-16 bg-[var(--colour-bg,#ffffff)]">
      <Container>
        <div className="max-w-2xl">
          <div className="border-t border-[var(--colour-primary)] border-opacity-10 pt-10">
            <h2
              className="mb-4 text-xl font-semibold text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              Description
            </h2>
            <p
              className="text-base leading-relaxed text-[var(--colour-primary)] opacity-70
              whitespace-pre-line"
            >
              {product.description}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
