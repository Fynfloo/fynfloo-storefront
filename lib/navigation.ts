import type { ActionTarget, LinkTarget, StorefrontLink, SystemPageKey } from '@/lib/types';

export type ResolvedLink = {
  href: string;
  external: boolean;
};

const SYSTEM_PAGE_PATHS: Record<SystemPageKey, string> = {
  home: '/',
  products: '/products',
  cart: '/cart',
  'account.login': '/account/login',
  'account.signup': '/account/signup',
  'account.orders': '/account/orders',
  'account.profile': '/account/profile',
  'checkout.success': '/checkout/success',
};

function normalizeStorePath(path: string): string {
  if (!path) return '/';
  if (path.startsWith('/')) return path;
  return `/${path}`;
}

function buildMailtoHref(email: string, subject?: string): string {
  if (!subject) return `mailto:${email}`;

  const search = new URLSearchParams({ subject });
  return `mailto:${email}?${search.toString()}`;
}

function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

export function resolveHref(
  href: string | null | undefined,
  external?: boolean,
): ResolvedLink | null {
  if (!href) return null;

  return {
    href,
    external: external ?? isExternalHref(href),
  };
}

export function resolveLinkTarget(target: LinkTarget): ResolvedLink {
  switch (target.type) {
    case 'path':
      return { href: normalizeStorePath(target.path), external: false };
    case 'systemPage':
      return { href: SYSTEM_PAGE_PATHS[target.page], external: false };
    case 'contentPage':
      return { href: normalizeStorePath(target.path), external: false };
    case 'product':
      return { href: `/products/${target.handle}`, external: false };
    case 'collection':
      return { href: `/collections/${target.handle}`, external: false };
    case 'external':
      return { href: target.url, external: true };
    case 'email':
      return { href: buildMailtoHref(target.email, target.subject), external: true };
    case 'phone':
      return { href: `tel:${target.phone}`, external: true };
  }
}

export function resolveActionTarget(
  action: ActionTarget | null | undefined,
): ResolvedLink | null {
  if (!action) return null;

  switch (action.type) {
    case 'link':
      return resolveLinkTarget(action.target);
    case 'scroll':
      return { href: `#${action.sectionId}`, external: false };
  }
}

export function resolveStorefrontLink(link: StorefrontLink): ResolvedLink | null {
  if (link.target) {
    return resolveLinkTarget(link.target);
  }

  return resolveHref(link.href, link.external);
}
