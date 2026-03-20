// components/sections/ProductGrid.tsx
import type { Product, ProductGridData } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { Container } from '@/components/ui/Container';

interface ProductGridProps {
  data: ProductGridData;
  slug: string;
}

const gridCols: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export async function ProductGrid({ data, slug }: ProductGridProps) {
  const { heading, subheading, collectionHandle, columns = 3 } = data;
  const products: Product[] = await fetchProducts(slug, collectionHandle);
  const colClass = gridCols[columns] ?? gridCols[3];

  return (
    <section className="py-16 md:py-24 bg-[var(--colour-bg,#ffffff)]">
      <Container>
        {(heading || subheading) && (
          <div className="mb-10 md:mb-14">
            {heading && (
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--colour-primary)]"
                style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
              >
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-2 text-base text-[var(--colour-primary)] opacity-60">{subheading}</p>
            )}
          </div>
        )}
        {products.length > 0 ? (
          <div className={`grid ${colClass} gap-x-4 gap-y-10 md:gap-x-6`}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium text-[var(--colour-primary)] opacity-40">
              No products yet
            </p>
            <p className="mt-2 text-sm text-[var(--colour-primary)] opacity-30">Check back soon</p>
          </div>
        )}
      </Container>
    </section>
  );
}
