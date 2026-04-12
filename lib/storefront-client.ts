// lib/storefront-client.ts
// Client-side API utilities — separate from lib/api.ts which is server-only.
//
// Two call patterns:
//
//   Public routes (products, cart) → browser → Express directly
//     Uses buildPublicHeaders — includes X-Store-Slug, X-Cart-Token
//     Uses credentials: 'include' for cart cookie
//
//   Auth routes (customer session, profile, orders) → browser → Next.js BFF
//     Uses buildBFFHeaders — includes x-store-slug, x-cart-token (lowercase)
//     Same origin — no CORS, no credentials needed
//     Cookie is managed server-side by Next.js API routes

import { getCartToken, setCartToken } from '@/lib/cart';
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

// ─── Headers ─────────────────────────────────────────────────────────────────

/**
 * Headers for public storefront routes — browser → Express directly.
 * Cart token read from cookie — always included if present.
 */
function buildPublicHeaders(slug: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-Slug': slug,
  };
  const cartToken = getCartToken();
  if (cartToken) h['X-Cart-Token'] = cartToken;
  return h;
}

/**
 * Headers for BFF routes — browser → Next.js API routes (same origin).
 * Lowercase header names — Next.js normalises them before forwarding.
 * Cart token included so BFF can forward it to Express, preventing
 * new cart creation on every authenticated page request.
 */
function buildBFFHeaders(slug: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-store-slug': slug,
  };
  const cartToken = getCartToken();
  if (cartToken) h['x-cart-token'] = cartToken;
  return h;
}

// ─── Cart — browser → Express directly ───────────────────────────────────────

export async function fetchCart(slug: string): Promise<CartResponse | null> {
  const res = await fetch(`${API_URL}/api/storefront/cart`, {
    headers: buildPublicHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data;
}

/**
 * Adds a product to the cart.
 * variantId is required when the product has variants — backend enforces this.
 * Passing null explicitly for products without variants.
 */
export async function addToCart(
  slug: string,
  productId: string,
  quantity: number,
  variantId?: string | null, // ← added
): Promise<Cart | null> {
  const res = await fetch(`${API_URL}/api/storefront/cart/items`, {
    method: 'POST',
    headers: buildPublicHeaders(slug),
    body: JSON.stringify({ productId, quantity, variantId: variantId ?? null }), // ← added
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

/**
 * Updates quantity of a specific cart item.
 * variantId must match the one used when the item was added — backend scopes
 * the update to the [productId, variantId] combination.
 */
export async function updateCartItem(
  slug: string,
  productId: string,
  quantity: number,
  variantId?: string | null, // ← added
): Promise<Cart> {
  const res = await fetch(`${API_URL}/api/storefront/cart/items/${productId}`, {
    method: 'PATCH',
    headers: buildPublicHeaders(slug),
    body: JSON.stringify({ quantity, variantId: variantId ?? null }), // ← added
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to update cart item: ${res.status}`);
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

/**
 * Removes a specific cart item.
 * variantId must match the one used when the item was added — backend scopes
 * the delete to the [productId, variantId] combination.
 * Body is required on DELETE so the backend knows which variant to remove.
 */
export async function removeCartItem(
  slug: string,
  productId: string,
  variantId?: string | null, // ← added
): Promise<Cart> {
  const res = await fetch(`${API_URL}/api/storefront/cart/items/${productId}`, {
    method: 'DELETE',
    headers: buildPublicHeaders(slug),
    body: JSON.stringify({ variantId: variantId ?? null }), // ← added
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to remove cart item: ${res.status}`);
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

/**
 * Applies a discount code to the cart.
 * Returns the updated cart on success.
 * Throws with error message on invalid/expired/limit reached.
 */
export async function applyDiscount(slug: string, code: string): Promise<Cart> {
  const res = await fetch(`${API_URL}/api/storefront/cart/discount`, {
    method: 'POST',
    headers: buildPublicHeaders(slug),
    body: JSON.stringify({ code }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Invalid discount code' }));
    throw new Error(data.error ?? 'Invalid discount code');
  }
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

/**
 * Removes the applied discount code from the cart.
 * Idempotent — safe to call even if no discount is applied.
 */
export async function removeDiscount(slug: string): Promise<Cart> {
  const res = await fetch(`${API_URL}/api/storefront/cart/discount`, {
    method: 'DELETE',
    headers: buildPublicHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to remove discount');
  const data = await res.json();
  if (data.cartToken) setCartToken(data.cartToken);
  return data.cart;
}

export async function initiateCheckout(slug: string): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: buildPublicHeaders(slug),
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? null;
}

// ─── Customer auth — browser → Next.js BFF (same origin) ─────────────────────

export async function checkCustomerSession(slug: string): Promise<boolean> {
  const res = await fetch('/api/storefront/auth/session', {
    headers: buildBFFHeaders(slug),
  });
  return res.ok;
}

export async function customerLogin(
  slug: string,
  email: string,
  password: string,
): Promise<{ ok: true; data: LoginResult } | { ok: false; status: number; error: ApiError }> {
  const res = await fetch('/api/storefront/auth/login', {
    method: 'POST',
    headers: buildBFFHeaders(slug),
    body: JSON.stringify({ email, password }),
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
  const res = await fetch('/api/storefront/auth/signup', {
    method: 'POST',
    headers: buildBFFHeaders(slug),
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) return { ok: true };
  const error = await res.json().catch(() => ({ error: 'Signup failed' }));
  return { ok: false, status: res.status, error };
}

export async function customerLogout(slug: string): Promise<void> {
  await fetch('/api/storefront/auth/logout', {
    method: 'POST',
    headers: buildBFFHeaders(slug),
  });
}

export async function confirmEmail(
  slug: string,
  token: string,
  uid: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `/api/storefront/email/confirm?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`,
    { headers: buildBFFHeaders(slug) },
  );
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({ error: 'Confirmation failed' }));
  return { ok: false, error: data.error ?? 'Confirmation failed' };
}

export async function forgotPassword(slug: string, email: string): Promise<void> {
  await fetch('/api/storefront/email/forgot-password', {
    method: 'POST',
    headers: buildBFFHeaders(slug),
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  slug: string,
  token: string,
  uid: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch('/api/storefront/email/reset-password', {
    method: 'POST',
    headers: buildBFFHeaders(slug),
    body: JSON.stringify({ token, uid, newPassword: password }),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({ error: 'Reset failed' }));
  return { ok: false, error: data.error ?? 'Reset failed' };
}

export async function getCustomerProfile(slug: string): Promise<CustomerProfile | null> {
  const res = await fetch('/api/storefront/customer/profile', {
    headers: buildBFFHeaders(slug),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateCustomerProfile(
  slug: string,
  data: { name?: string; phone?: string },
): Promise<CustomerProfile | null> {
  const res = await fetch('/api/storefront/customer/profile', {
    method: 'PATCH',
    headers: buildBFFHeaders(slug),
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getCustomerOrders(slug: string): Promise<Order[]> {
  const res = await fetch('/api/storefront/customer/orders', {
    headers: buildBFFHeaders(slug),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders ?? data ?? [];
}

export async function getCustomerOrder(slug: string, orderId: string): Promise<OrderDetail | null> {
  const res = await fetch(`/api/storefront/customer/orders/${orderId}`, {
    headers: buildBFFHeaders(slug),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getOrderBySessionId(
  slug: string,
  sessionId: string,
): Promise<OrderDetail | null> {
  const res = await fetch(
    `/api/storefront/customer/orders/by-session?sessionId=${encodeURIComponent(sessionId)}`,
    { headers: buildBFFHeaders(slug) },
  );
  if (!res.ok) return null;
  return res.json();
}
