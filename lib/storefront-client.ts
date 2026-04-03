// lib/storefront-client.ts
// Client-side API utilities — separate from lib/api.ts which is server-only.

import { getCartToken, setCartToken } from '@/lib/cart';
import { getSessionToken, setSessionToken, clearSessionToken } from '@/lib/session';
import type {
  Cart,
  CartResponse,
  LoginResult,
  ApiError,
  CustomerProfile,
  Order,
  OrderDetail,
} from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const IS_DEV = process.env.NEXT_PUBLIC_ENV === 'development';

// ─── Headers ─────────────────────────────────────────────────────────────────

/**
 * Builds the standard headers for all storefront API requests.
 *
 * Always includes:
 *   Content-Type: application/json
 *   X-Store-Slug: <slug>          → resolveStorefront middleware
 *
 * Conditionally includes:
 *   X-Cart-Token: <token>          → resolveCart middleware
 *                                    read from cookie automatically — DRY
 *   X-Session-Token: <token>       → resolveCustomer middleware
 *                                    development only — cookie is blocked
 *                                    cross-origin on localhost
 */
function buildHeaders(slug: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-Slug': slug,
  };

  // Always include cart token if present
  const cartToken = getCartToken();
  if (cartToken) h['X-Cart-Token'] = cartToken;

  // Session token header — development only
  // In production the httpOnly cookie is sent automatically via credentials: include
  // In development the cookie is blocked cross-origin (localhost:3000 → localhost:8080)
  // so we fall back to the header which the backend accepts only in development mode
  if (IS_DEV) {
    const sessionToken = getSessionToken();
    if (sessionToken) h['X-Session-Token'] = sessionToken;
  }

  return h;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function fetchCart(slug: string): Promise<CartResponse | null> {
  const res = await fetch(`${API_URL}/api/storefront/cart`, {
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data;
}

export async function addToCart(
  slug: string,
  productId: string,
  quantity: number,
): Promise<Cart | null> {
  const res = await fetch(`${API_URL}/api/storefront/cart/items`, {
    method: 'POST',
    headers: buildHeaders(slug),
    body: JSON.stringify({ productId, quantity }),
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

export async function updateCartItem(
  slug: string,
  productId: string,
  quantity: number,
): Promise<Cart> {
  const res = await fetch(`${API_URL}/api/storefront/cart/items/${productId}`, {
    method: 'PATCH',
    headers: buildHeaders(slug),
    body: JSON.stringify({ quantity }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to update cart item: ${res.status}`);
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

export async function removeCartItem(slug: string, productId: string): Promise<Cart> {
  const res = await fetch(`${API_URL}/api/storefront/cart/items/${productId}`, {
    method: 'DELETE',
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to remove cart item: ${res.status}`);
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

export async function initiateCheckout(slug: string): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? null;
}

export async function checkCustomerSession(slug: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/storefront/customer/profile`, {
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  return res.ok;
}

// ─── Customer auth ────────────────────────────────────────────────────────────

export async function customerLogin(
  slug: string,
  email: string,
  password: string,
): Promise<{ ok: true; data: LoginResult } | { ok: false; status: number; error: ApiError }> {
  const res = await fetch(`${API_URL}/api/storefront/customer/login`, {
    method: 'POST',
    headers: buildHeaders(slug),
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (res.ok) {
    const data = await res.json();
    // Store session token in localStorage for dev cross-origin header auth
    // Production uses httpOnly cookie only — token never stored in localStorage
    if (IS_DEV && data.sessionToken) setSessionToken(data.sessionToken);
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
    headers: buildHeaders(slug),
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (res.ok) return { ok: true };
  const error = await res.json().catch(() => ({ error: 'Signup failed' }));
  return { ok: false, status: res.status, error };
}

export async function customerLogout(slug: string): Promise<void> {
  await fetch(`${API_URL}/api/storefront/customer/logout`, {
    method: 'POST',
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  // Clear local session token regardless of server response
  if (IS_DEV) clearSessionToken();
}

export async function confirmEmail(
  slug: string,
  token: string,
  uid: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `${API_URL}/api/storefront/customer/confirm-email?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`,
    {
      headers: buildHeaders(slug),
      credentials: 'include',
    },
  );
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({ error: 'Confirmation failed' }));
  return { ok: false, error: data.error ?? 'Confirmation failed' };
}

export async function forgotPassword(slug: string, email: string): Promise<void> {
  await fetch(`${API_URL}/api/storefront/customer/forgot-password`, {
    method: 'POST',
    headers: buildHeaders(slug),
    body: JSON.stringify({ email }),
    credentials: 'include',
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
    headers: buildHeaders(slug),
    body: JSON.stringify({ token, uid, newPassword: password }),
    credentials: 'include',
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({ error: 'Reset failed' }));
  return { ok: false, error: data.error ?? 'Reset failed' };
}

export async function getCustomerProfile(slug: string): Promise<CustomerProfile | null> {
  const res = await fetch(`${API_URL}/api/storefront/customer/profile`, {
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateCustomerProfile(
  slug: string,
  data: { name?: string; phone?: string },
): Promise<CustomerProfile | null> {
  const res = await fetch(`${API_URL}/api/storefront/customer/profile`, {
    method: 'PATCH',
    headers: buildHeaders(slug),
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getCustomerOrders(slug: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/api/storefront/customer/orders`, {
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders ?? data ?? [];
}

export async function getCustomerOrder(slug: string, orderId: string): Promise<OrderDetail | null> {
  const res = await fetch(`${API_URL}/api/storefront/customer/orders/${orderId}`, {
    headers: buildHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getOrderBySessionId(
  slug: string,
  sessionId: string,
): Promise<OrderDetail | null> {
  const res = await fetch(
    `${API_URL}/api/storefront/customer/orders/by-session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      headers: buildHeaders(slug),
      credentials: 'include',
    },
  );
  if (!res.ok) return null;
  return res.json();
}
