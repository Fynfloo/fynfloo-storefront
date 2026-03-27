import type { ThemeSettings } from './theme';

// ─── Store ────────────────────────────────────────────────────────────────────

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  businessType: string;
  templateKey: string;
  currency: string; // 'GBP' | 'NGN' | 'USD' | 'GHS' | 'KES' | 'ZAR' etc.
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
  metadata: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
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

/**
 * Formats a price in minor units (pence/kobo/cents) to a localised currency string.
 * currency defaults to 'GBP' but should always be passed from store.currency.
 *
 * formatPrice(1000, 'GBP')  -> £10.00
 * formatPrice(100000, 'NGN') -> ₦1,000.00
 * formatPrice(1000, 'USD')  -> $10.00
 */
export function formatPrice(minorUnits: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(minorUnits / 100);
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

export interface CartResponse {
  cart: Cart;
  cartToken?: string;
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

// ─── Customer auth ────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
}

export interface LoginResult {
  customer: CustomerProfile;
  next?: string;
}

export interface ApiError {
  error: string;
  lockedUntil?: string; // ISO date string — present on 423
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: string;
  fulfillmentStatus: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    postcode: string;
    country: string;
  } | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}
