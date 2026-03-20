// components/sections/RelatedProducts.tsx
import type { Product, RelatedProductsData } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { Container } from '@/components/ui/Container';

interface RelatedProductsProps {
  data: RelatedProductsData;
  slug: string;
  currentProductId: string;
}

export async function RelatedProducts({ data, slug, currentProductId }: RelatedProductsProps) {
  const { heading } = data;
  const allProducts: Product[] = await fetchProducts(slug);
  const related = allProducts
    .filter((p) => p.id !== currentProductId && p.status === 'ACTIVE')
    .slice(0, 4);

  if (!related.length) return null;

  return (
    <section className="py-16 md:py-20 bg-[var(--colour-bg,#ffffff)]">
      <Container>
        <div className="border-t border-[var(--colour-primary)] border-opacity-10 pt-12">
          {heading && (
            <h2
              className="mb-10 text-2xl md:text-3xl font-bold tracking-tight text-[var(--colour-primary)]"
              style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
            >
              {heading}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
