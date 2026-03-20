// lib/page.ts
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { fetchProduct, fetchStoreData, fetchStorePage } from '@/lib/api';
import type { Product, Section, StoreData, StorePage } from '@/lib/types';

export interface StorePageContext {
  store: StoreData;
  page: StorePage;
  slug: string;
}

export interface ProductPageContext extends StorePageContext {
  product: Product;
}

/**
 * Type-safe helper to find a section by type from a layout array.
 * Uses a type predicate to narrow the discriminated union so the
 * returned section's data property is correctly typed — no casts needed.
 *
 * Example:
 *   const section = findSection(page.layout, 'checkout.cartItems');
 *   section?.data // CartItemsData — fully typed
 */
export function findSection<T extends Section['type']>(
  layout: Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return layout.find((s): s is Extract<Section, { type: T }> => s.type === type);
}

/**
 * Resolves slug, fetches store + page data in parallel.
 * Calls notFound() if anything is missing.
 * Used by: home, products listing, cart, and any simple store page.
 */
export async function resolveStorePage(path: string): Promise<StorePageContext> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');

  if (!slug) notFound();

  const [store, page] = await Promise.all([fetchStoreData(slug), fetchStorePage(slug, path)]);

  if (!store || !page) notFound();

  return { store, page, slug };
}

/**
 * Resolves slug, fetches store + page + product in parallel.
 * Calls notFound() if anything is missing.
 * Used by: /products/[handle]
 */
export async function resolveProductPage(handle: string): Promise<ProductPageContext> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');

  if (!slug) notFound();

  const [store, page, product] = await Promise.all([
    fetchStoreData(slug),
    fetchStorePage(slug, '/products/[handle]'),
    fetchProduct(slug, handle),
  ]);

  if (!store || !page || !product) notFound();

  return { store, page, slug, product };
}
