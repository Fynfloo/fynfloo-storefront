import Link from 'next/link';
import type { Product, ProductGridData, StoreData } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { Container } from '@/components/ui/Container';

interface ProductGridProps {
  data: ProductGridData;
  slug: string;
  store: StoreData;
}

const gridCols: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export async function ProductGrid({ data, slug, store }: ProductGridProps) {
  const { heading, subheading, collectionHandle, columns = 3 } = data;
  const products: Product[] = await fetchProducts(slug, collectionHandle);
  const colClass = gridCols[columns] ?? gridCols[3];

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {(heading || subheading) && (
          <div className="mb-10 md:mb-14 flex items-end justify-between">
            <div>
              {heading && (
                <h2
                  className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--colour-primary)]"
                  style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
                >
                  {heading}
                </h2>
              )}
              {subheading && (
                <p className="mt-2 text-base text-[var(--colour-primary)] opacity-50">{subheading}</p>
              )}
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--colour-primary)] opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap ml-8"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}

        {products.length > 0 ? (
          <div className={`grid ${colClass} gap-x-4 gap-y-10 md:gap-x-6`}>
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={store.currency}
                priority={i < 4}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium text-[var(--colour-primary)] opacity-40">No products yet</p>
            <p className="mt-2 text-sm text-[var(--colour-primary)] opacity-30">Check back soon</p>
          </div>
        )}

        {/* Mobile view all link */}
        {products.length > 0 && (
          <div className="mt-10 text-center md:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--colour-primary)] underline-offset-4 hover:underline"
            >
              View all products
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
