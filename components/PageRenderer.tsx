// components/PageRenderer.tsx
import type { Section, Product } from '@/lib/types';
import {
  HeroBasic,
  ProductGrid,
  ProductHero,
  ProductSpecs,
  RelatedProducts,
  Testimonials,
  TextWithMedia,
} from './sections';

export interface PageContext {
  storeId: string;
  slug: string;
  product?: Product;
  productId?: string;
}

const DEFAULT_CONTEXT: PageContext = { storeId: '', slug: '' };

interface PageRendererProps {
  sections: Section[];
  context?: PageContext;
}

export function PageRenderer({ sections, context = DEFAULT_CONTEXT }: PageRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} context={context} />
      ))}
    </>
  );
}

interface SectionRendererProps {
  section: Section;
  context: PageContext;
}

function SectionRenderer({ section, context }: SectionRendererProps) {
  switch (section.type) {
    case 'hero.basic':
      return <HeroBasic data={section.data} />;

    case 'commerce.productGrid':
      return <ProductGrid data={section.data} slug={context.slug} />;

    case 'commerce.productHero':
      if (!context.product) return null;
      return <ProductHero data={section.data} product={context.product} slug={context.slug} />;

    case 'commerce.productSpecs':
      if (!context.product) return null;
      return <ProductSpecs data={section.data} product={context.product} />;

    case 'commerce.relatedProducts':
      if (!context.productId) return null;
      return (
        <RelatedProducts
          data={section.data}
          slug={context.slug}
          currentProductId={context.productId}
        />
      );

    case 'content.textWithMedia':
      return <TextWithMedia data={section.data} />;

    case 'content.testimonials':
      return <Testimonials data={section.data} />;

    default:
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="p-4 border border-dashed border-amber-300 text-amber-600 text-xs">
            Unknown section type: {(section as { type: string }).type}
          </div>
        );
      }
      return null;
  }
}
