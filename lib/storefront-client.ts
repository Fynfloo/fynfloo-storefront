// lib/storefront-client.ts
// Client-side API utilities — separate from lib/api.ts which is server-only.

import { getCartToken, setCartToken } from '@/lib/cart';
import type {
  Cart,
  CartResponse,
  LoginResult,
  ApiError,
  CustomerProfile,
  Order,
} from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildHeaders(slug: string, cartToken?: string | null): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-Slug': slug,
  };
  if (cartToken) h['X-Cart-Token'] = cartToken;
  return h;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function fetchCart(slug: string): Promise<CartResponse | null> {
  const cartToken = getCartToken();
  const res = await fetch(`${API_URL}/api/storefront/cart`, {
    headers: buildHeaders(slug, cartToken),
    credentials: 'include',
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
    headers: buildHeaders(slug, cartToken),
    body: JSON.stringify({ productId, quantity }),
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

export async function initiateCheckout(slug: string): Promise<string | null> {
  const cartToken = getCartToken();
  const res = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: buildHeaders(slug, cartToken),
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

// ─── Customer auth ────────────────────────────────────────────────────────────

export async function customerLogin(
  slug: string,
  email: string,
  password: string,
  cartToken?: string | null,
): Promise<{ ok: true; data: LoginResult } | { ok: false; status: number; error: ApiError }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-Slug': slug,
  };
  if (cartToken) headers['X-Cart-Token'] = cartToken;

  const res = await fetch(`${API_URL}/api/storefront/customer/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (res.ok) {
    const data = await res.json();
    return { ok: true, data };
  }

  const error = await res.json().catch(() => ({ error: 'Login failed' }));
  return { ok: false, status: res.status, error };
}

export async function customerSignup(
  slug: string,
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; status: number; error: ApiError }> {
  const res = await fetch(`${API_URL}/api/storefront/customer/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Store-Slug': slug },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) return { ok: true };
  const error = await res.json().catch(() => ({ error: 'Signup failed' }));
  return { ok: false, status: res.status, error };
}

export async function customerLogout(slug: string): Promise<void> {
  await fetch(`${API_URL}/api/storefront/customer/logout`, {
    method: 'POST',
    headers: { 'X-Store-Slug': slug },
    credentials: 'include',
  });
}

export async function confirmEmail(
  slug: string,
  token: string,
  uid: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `${API_URL}/api/storefront/customer/confirm-email?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`,
    {
      headers: { 'X-Store-Slug': slug },
    },
  );
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({ error: 'Confirmation failed' }));
  return { ok: false, error: data.error ?? 'Confirmation failed' };
}

export async function forgotPassword(slug: string, email: string): Promise<void> {
  await fetch(`${API_URL}/api/storefront/customer/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Store-Slug': slug },
    body: JSON.stringify({ email }),
  });
  // Always resolves — backend returns 200 regardless to prevent enumeration
}

export async function resetPassword(
  slug: string,
  token: string,
  uid: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${API_URL}/api/storefront/customer/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Store-Slug': slug },
    body: JSON.stringify({ token, uid, password }),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({ error: 'Reset failed' }));
  return { ok: false, error: data.error ?? 'Reset failed' };
}

export async function getCustomerProfile(slug: string): Promise<CustomerProfile | null> {
  const res = await fetch(`${API_URL}/api/storefront/customer/profile`, {
    headers: { 'X-Store-Slug': slug },
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateCustomerProfile(
  slug: string,
  data: { firstName?: string; lastName?: string },
): Promise<CustomerProfile | null> {
  const res = await fetch(`${API_URL}/api/storefront/customer/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Store-Slug': slug },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getCustomerOrders(slug: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/api/storefront/customer/orders`, {
    headers: { 'X-Store-Slug': slug },
    credentials: 'include',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getOrderBySessionId(slug: string, sessionId: string): Promise<Order | null> {
  const res = await fetch(
    `${API_URL}/api/storefront/orders/by-session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      headers: { 'X-Store-Slug': slug },
      credentials: 'include',
    },
  );
  if (!res.ok) return null;
  return res.json();
}
