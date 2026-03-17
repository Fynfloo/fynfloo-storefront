// components/PageRenderer.tsx
import type {
  Section,
  HeroBasicData,
  ProductGridData,
  ProductHeroData,
  ProductSpecsData,
  RelatedProductsData,
  TextWithMediaData,
  TestimonialsData,
  CartItemsData,
  CartSummaryData,
  Product,
} from '@/lib/types';
import { HeroBasic } from './sections/HeroBasic';
import { ProductGrid } from './sections/ProductGrid';
import { ProductHero } from './sections/ProductHero';
import { ProductSpecs } from './sections/ProductSpecs';
import { RelatedProducts } from './sections/RelatedProducts';
import { TextWithMedia } from './sections/TextWithMedia';
import { Testimonials } from './sections/Testimonials';
import { CartItems } from './sections/CartItems';
import { CartSummary } from './sections/CartSummary';

interface PageRendererProps {
  sections: Section[];
  context?: Record<string, unknown>;
}

export function PageRenderer({ sections, context = {} }: PageRendererProps) {
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
  context: Record<string, unknown>;
}

function SectionRenderer({ section, context }: SectionRendererProps) {
  const { type, data } = section;

  switch (type) {
    case 'hero.basic':
      return <HeroBasic data={data as unknown as HeroBasicData} />;

    case 'commerce.productGrid':
      return (
        <ProductGrid
          data={data as unknown as ProductGridData}
          storeId={context.storeId as string}
          slug={context.slug as string}
        />
      );

    case 'commerce.productHero':
      return (
        <ProductHero
          data={data as unknown as ProductHeroData}
          product={context.product as Product}
          slug={context.slug as string}
        />
      );

    case 'commerce.productSpecs':
      return (
        <ProductSpecs
          data={data as unknown as ProductSpecsData}
          product={context.product as Product}
        />
      );

    case 'commerce.relatedProducts':
      return (
        <RelatedProducts
          data={data as unknown as RelatedProductsData}
          storeId={context.storeId as string}
          slug={context.slug as string}
          currentProductId={context.productId as string}
        />
      );

    case 'content.textWithMedia':
      return <TextWithMedia data={data as unknown as TextWithMediaData} />;

    case 'content.testimonials':
      return <Testimonials data={data as unknown as TestimonialsData} />;

    case 'checkout.cartItems':
      return <CartItems data={data as unknown as CartItemsData} slug={context.slug as string} />;

    case 'checkout.cartSummary':
      return (
        <CartSummary data={data as unknown as CartSummaryData} slug={context.slug as string} />
      );

    default:
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="p-4 border border-dashed border-amber-300 text-amber-600 text-xs">
            Section not yet built: {type}
          </div>
        );
      }
      return null;
  }
}
