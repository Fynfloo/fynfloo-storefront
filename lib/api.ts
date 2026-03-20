// lib/api.ts
import type { StoreData, StorePage, Product } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  slug?: string;
  cartToken?: string;
  headers?: Record<string, string>;
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { slug, cartToken, headers, next, ...rest } = options;

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (slug) mergedHeaders['X-Store-Slug'] = slug;
  if (cartToken) mergedHeaders['X-Cart-Token'] = cartToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
    // next is a Next.js fetch extension — passed through directly
    ...(next ? { next } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchStoreData(slug: string): Promise<StoreData | null> {
  try {
    return await apiFetch<StoreData>(`/api/storefront/stores/${slug}`, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

export async function fetchStorePage(slug: string, path: string): Promise<StorePage | null> {
  try {
    return await apiFetch<StorePage>(`/api/storefront/pages?path=${encodeURIComponent(path)}`, {
      slug,
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

export async function fetchProduct(slug: string, handle: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/storefront/products/${handle}`, {
      slug,
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

export async function fetchProducts(slug: string, collection?: string | null): Promise<Product[]> {
  try {
    const path = collection
      ? `/api/storefront/products?collection=${collection}`
      : `/api/storefront/products`;
    return await apiFetch<Product[]>(path, {
      slug,
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}
