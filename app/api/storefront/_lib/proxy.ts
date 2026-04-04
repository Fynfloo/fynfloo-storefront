// app/api/storefront/_lib/proxy.ts
// Shared utilities for all BFF route handlers.
// Keeps constants and header building DRY across all 11 route files.

export const API_URL = process.env.API_URL ?? 'http://localhost:8080';
export const BFF_SECRET = process.env.BFF_SECRET ?? '';
export const SESSION_COOKIE = 'storefront-session';
export const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Builds headers for server-to-server calls from Next.js BFF → Express API.
 *
 * Always includes:
 *   Content-Type: application/json
 *   X-Store-Slug               → resolveStorefront middleware
 *   X-BFF-Secret               → requireBFFSecret middleware
 *
 * Conditionally includes:
 *   Authorization: Bearer      → resolveCustomer middleware (authenticated routes)
 *   X-Cart-Token               → resolveCart middleware (preserves existing cart)
 */
export function buildExpressHeaders(
  slug: string,
  token?: string | null,
  cartToken?: string | null,
): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-Slug': slug,
    'X-BFF-Secret': BFF_SECRET,
  };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (cartToken) h['X-Cart-Token'] = cartToken;
  return h;
}
