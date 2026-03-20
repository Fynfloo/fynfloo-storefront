// lib/storefront-client.ts
// Client-side API utilities for storefront components.
// These are separate from lib/api.ts which is server-only
// (uses Next.js fetch extensions that don't work in client components).

import { getCartToken, setCartToken } from '@/lib/cart';
import type { Cart } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function buildHeaders(slug: string, cartToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'X-Store-Slug': slug };
  if (cartToken) headers['X-Cart-Token'] = cartToken;
  return headers;
}

export interface CartResponse {
  cart: Cart;
  cartToken?: string;
}

export async function fetchCart(slug: string): Promise<CartResponse | null> {
  const cartToken = getCartToken();
  const res = await fetch(`${API_URL}/api/storefront/cart`, {
    headers: buildHeaders(slug, cartToken),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data;
}

export async function updateCartItem(
  slug: string,
  productId: string,
  quantity: number,
): Promise<Cart | null> {
  const cartToken = getCartToken();
  const res = await fetch(`${API_URL}/api/storefront/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildHeaders(slug, cartToken) },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.cart;
}

export async function initiateCheckout(slug: string): Promise<string | null> {
  const cartToken = getCartToken();
  const res = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildHeaders(slug, cartToken) },
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? null;
}

export async function checkCustomerSession(slug: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/storefront/customer/profile`, {
    headers: { 'X-Store-Slug': slug },
    credentials: 'include',
  });
  return res.ok;
}
