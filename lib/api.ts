// lib/api.ts
import type { StoreData, StorePage, Product } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface RequestOptions extends RequestInit {
  slug?: string;
  cartToken?: string;
}

/**
 * Typed API client for the Fynfloo backend.
 * Automatically attaches X-Store-Slug and X-Cart-Token headers.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { slug, cartToken, headers, ...rest } = options;

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (slug) mergedHeaders['X-Store-Slug'] = slug;
  if (cartToken) mergedHeaders['X-Cart-Token'] = cartToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetches store data by slug.
 * Used in server components to get store id and themeSettings.
 */
export async function fetchStoreData(slug: string): Promise<StoreData | null> {
  try {
    return await apiFetch<StoreData>(`/api/storefront/stores/${slug}`, {
      next: { revalidate: 60 },
    } as RequestOptions);
  } catch {
    return null;
  }
}

/**
 * Fetches a store page by path.
 * Used in server components to get the section layout.
 */
export async function fetchStorePage(slug: string, path: string): Promise<StorePage | null> {
  try {
    return await apiFetch<StorePage>(`/api/storefront/pages?path=${encodeURIComponent(path)}`, {
      slug,
      next: { revalidate: 60 },
    } as RequestOptions);
  } catch {
    return null;
  }
}

/**
 * Fetches a product by handle.
 */
export async function fetchProduct(slug: string, handle: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/storefront/products/${handle}`, {
      slug,
      next: { revalidate: 60 },
    } as RequestOptions);
  } catch {
    return null;
  }
}

/**
 * Fetches products, optionally filtered by collection.
 */
export async function fetchProducts(slug: string, collection?: string | null): Promise<Product[]> {
  try {
    const path = collection
      ? `/api/storefront/products?collection=${collection}`
      : `/api/storefront/products`;
    return await apiFetch<Product[]>(path, {
      slug,
      next: { revalidate: 60 },
    } as RequestOptions);
  } catch {
    return [];
  }
}
