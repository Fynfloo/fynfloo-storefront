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
    <section className="py-10 md:py-14 bg-white">
      <Container>
        <div className="max-w-3xl">
          <div className="border-t border-[var(--colour-primary)]/8 pt-10">
            {/* Tab bar (single tab for now, expandable later) */}
            <div className="flex gap-6 mb-8 border-b border-[var(--colour-primary)]/8">
              <button className="relative pb-3 text-sm font-semibold text-[var(--colour-primary)]">
                Description
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--colour-primary)] rounded-full" />
              </button>
            </div>

            <div className="prose-sm text-[var(--colour-primary)]/70 leading-relaxed whitespace-pre-line space-y-4">
              {product.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Shipping info strip */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <svg className="w-5 h-5 text-[var(--colour-primary)]/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-[var(--colour-primary)]">Free shipping</p>
                  <p className="text-xs text-[var(--colour-primary)]/50 mt-0.5">On all orders</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <svg className="w-5 h-5 text-[var(--colour-primary)]/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-[var(--colour-primary)]">Easy returns</p>
                  <p className="text-xs text-[var(--colour-primary)]/50 mt-0.5">30-day policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <svg className="w-5 h-5 text-[var(--colour-primary)]/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-[var(--colour-primary)]">Secure payment</p>
                  <p className="text-xs text-[var(--colour-primary)]/50 mt-0.5">256-bit SSL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
