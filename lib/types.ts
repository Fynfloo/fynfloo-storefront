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
  currency: string;
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

// One option axis — e.g. { id, name: "Size", values: ["S","M","L"], position: 0 }
export interface ProductOption {
  id: string;
  name: string;
  values: string[];
  position: number;
}

// One variant combination — e.g. S / Black
export interface ProductVariant {
  id: string;
  title: string; // "S / Black" — auto-generated
  sku: string | null;
  price: number; // minor units — overrides product.price at checkout
  compareAtPrice: number | null;
  options: Record<string, string>; // { "Size": "S", "Colour": "Black" }
  trackQuantity: boolean;
  onHand: number | null;
  lowStockThreshold: number | null;
  allowOversell: boolean;
  position: number;
}

export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE';

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  price: number; // base price — used when no variants
  compareAtPrice: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  productType: ProductType; // ← added — controls UI behaviour
  trackStock: boolean;
  stockOnHand: number | null;
  lowStockThreshold: number | null;
  allowOversell: boolean; // ← added — needed for stock checks
  images: ProductImage[];
  options: ProductOption[]; // ← added — empty array when no variants
  variants: ProductVariant[]; // ← added — empty array when no variants
  metadata: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Derives stock status from a product with no variant selected.
 * When a variant is selected, use getVariantStockStatus instead.
 */
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
 * Derives stock status from a selected variant.
 * Called when customer has selected a variant combination.
 */
export function getVariantStockStatus(variant: ProductVariant): StockStatus {
  if (!variant.trackQuantity) return 'in_stock';
  if (variant.onHand === null) return 'in_stock';
  if (variant.onHand <= 0) return 'out_of_stock';
  if (variant.lowStockThreshold !== null && variant.onHand <= variant.lowStockThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
}

/**
 * Formats a price in minor units (pence/kobo/cents) to a localised currency string.
 * currency defaults to 'GBP' but should always be passed from store.currency.
 *
 * formatPrice(1000, 'GBP')   -> £10.00
 * formatPrice(100000, 'NGN') -> ₦1,000.00
 * formatPrice(1000, 'USD')   -> $10.00
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
  variantId: string | null; // ← added — null for products without variants
  variantTitle: string | null; // ← added — e.g. "S / Black", null if no variant
  title: string;
  handle: string;
  price: number; // variant price when variantId present, else product price
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
  name: string | null;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginResult {
  customer: CustomerProfile;
  sessionToken: string;
  next?: string;
}

export interface ApiError {
  error: string;
  lockedUntil?: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  orderNumber: number;
  status: string;
  fulfilmentStatus: string;
  totalPence: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
}

export interface OrderDetail extends Order {
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

export interface OrderItem {
  id: string;
  name: string;
  sku: string | null;
  pricePence: number;
  quantity: number;
  imageUrl: string | null;
}
