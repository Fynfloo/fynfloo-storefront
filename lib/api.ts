// lib/api.ts
import { cookies } from 'next/headers';
import type { StoreData, StorePage, Product, CustomerProfile, Order, OrderDetail } from '@/lib/types';
import { STOREFRONT_PREVIEW_COOKIE } from '@/app/api/storefront/_lib/proxy';

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

async function getStorefrontRenderFetchOptions(): Promise<
  Pick<RequestOptions, 'headers' | 'cache' | 'next'>
> {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get(STOREFRONT_PREVIEW_COOKIE)?.value ?? null;

  if (!previewToken) {
    return {
      headers: {},
      next: { revalidate: 60 },
    };
  }

  return {
    headers: {
      'X-Storefront-Preview': previewToken,
    },
    cache: 'no-store',
  };
}

export async function fetchStoreData(slug: string): Promise<StoreData | null> {
  try {
    const renderFetchOptions = await getStorefrontRenderFetchOptions();

    return await apiFetch<StoreData>(`/api/storefront/stores/${slug}`, {
      ...renderFetchOptions,
    });
  } catch {
    return null;
  }
}

export async function fetchStorePage(slug: string, path: string): Promise<StorePage | null> {
  try {
    const renderFetchOptions = await getStorefrontRenderFetchOptions();

    return await apiFetch<StorePage>(`/api/storefront/pages?path=${encodeURIComponent(path)}`, {
      slug,
      ...renderFetchOptions,
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

// ─── Authenticated customer fetches (server-only) ─────────────────────────────

const PRIVATE_API_URL = process.env.API_URL ?? 'http://localhost:8080';
const BFF_SECRET = process.env.BFF_SECRET ?? '';

function buildAuthHeaders(slug: string, token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Store-Slug': slug,
    'X-BFF-Secret': BFF_SECRET,
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCustomerProfile(
  slug: string,
  token: string,
): Promise<CustomerProfile | null> {
  try {
    const res = await fetch(`${PRIVATE_API_URL}/api/storefront/customer/profile`, {
      headers: buildAuthHeaders(slug, token),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCustomerOrders(slug: string, token: string): Promise<Order[]> {
  try {
    const res = await fetch(`${PRIVATE_API_URL}/api/storefront/customer/orders`, {
      headers: buildAuthHeaders(slug, token),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders ?? data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCustomerOrder(
  slug: string,
  token: string,
  orderId: string,
): Promise<OrderDetail | null> {
  try {
    const res = await fetch(`${PRIVATE_API_URL}/api/storefront/customer/orders/${orderId}`, {
      headers: buildAuthHeaders(slug, token),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateCustomerProfile(
  slug: string,
  token: string,
  data: { name?: string; phone?: string },
): Promise<CustomerProfile | null> {
  try {
    const res = await fetch(`${PRIVATE_API_URL}/api/storefront/customer/profile`, {
      method: 'PATCH',
      headers: buildAuthHeaders(slug, token),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
