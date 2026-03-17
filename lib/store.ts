import type { ThemeSettings } from './theme';

export interface StoreContext {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  themeSettings: Partial<ThemeSettings>;
}

/**
 * Resolves the store slug from the incoming Host header.
 * Handles both subdomain and custom domain patterns:
 *   my-store.fynfloo.com → slug = 'my-store'
 *   www.mybrand.com      → slug resolved by custom domain in middleware
 */
export function resolveSlugFromHost(host: string): string | null {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'fynfloo.com';

  if (host.endsWith(`.${baseDomain}`)) {
    return host.replace(`.${baseDomain}`, '');
  }

  // Custom domain — slug resolved via API lookup in middleware
  return null;
}
