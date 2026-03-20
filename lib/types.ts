// lib/types.ts
import type { ThemeSettings } from './theme';

// ─── Store ────────────────────────────────────────────────────────────────────

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  businessType: string;
  templateKey: string;
  themeSettings: ThemeSettings;
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export interface StorePage {
  id: string;
  kind: string;
  path: string;
  layout: Section[];
}

export type Section =
  | { id: string; type: 'hero.basic'; data: HeroBasicData }
  | { id: string; type: 'commerce.productGrid'; data: ProductGridData }
  | { id: string; type: 'commerce.productHero'; data: ProductHeroData }
  | { id: string; type: 'commerce.productSpecs'; data: ProductSpecsData }
  | { id: string; type: 'commerce.relatedProducts'; data: RelatedProductsData }
  | { id: string; type: 'content.textWithMedia'; data: TextWithMediaData }
  | { id: string; type: 'content.testimonials'; data: TestimonialsData }
  | { id: string; type: 'checkout.cartItems'; data: CartItemsData }
  | { id: string; type: 'checkout.cartSummary'; data: CartSummaryData };

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  alt: string | null;
  position: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  trackStock: boolean;
  stockOnHand: number | null;
  lowStockThreshold: number | null;
  images: ProductImage[];
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(product: Product): StockStatus {
  if (!product.trackStock) return 'in_stock';
  if (product.stockOnHand === null) return 'in_stock';
  if (product.stockOnHand <= 0) return 'out_of_stock';
  if (product.lowStockThreshold !== null && product.stockOnHand <= product.lowStockThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
}

export function formatPrice(pence: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  handle: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
}

// ─── Section data shapes ──────────────────────────────────────────────────────

export interface HeroBasicData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface ProductGridData {
  heading?: string;
  subheading?: string;
  collectionHandle: string | null;
  columns: number;
}

export interface ProductHeroData {
  showBreadcrumbs: boolean;
  showBadges: boolean;
}

export interface ProductSpecsData {
  showDescription: boolean;
  showDetailsList: boolean;
}

export interface RelatedProductsData {
  heading: string;
}

export interface TextWithMediaData {
  eyebrow?: string;
  title: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition: 'left' | 'right';
}

export interface TestimonialsData {
  heading: string;
  testimonials: { quote: string; name: string }[];
}

export interface CartItemsData {
  showThumbnails: boolean;
  showLineTotals: boolean;
}

export interface CartSummaryData {
  showDiscountCode: boolean;
}
