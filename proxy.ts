import { NextRequest, NextResponse } from 'next/server';

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'fynfloo.com';

/**
 * Resolves tenant from the Host header on every incoming request.
 * Passes store context to layouts and pages via request headers.
 *
 * Two patterns:
 *   my-store.fynfloo.com → X-Store-Slug: my-store
 *   www.mybrand.com      → X-Store-Domain: www.mybrand.com
 *
 * Also forwards x-pathname — used by account/layout.tsx to determine
 * whether the current path is a public auth page (login, signup etc.)
 * or a protected page (profile, orders) requiring an auth guard.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const requestHeaders = new Headers(request.headers);

  // Always forward pathname — needed by account layout auth guard
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    // Subdomain store — extract slug
    const slug = host.replace(`.${BASE_DOMAIN}`, '');

    if (!slug || slug === 'www') {
      return NextResponse.redirect(new URL('https://' + BASE_DOMAIN));
    }

    requestHeaders.set('x-store-slug', slug);
    requestHeaders.set('x-store-resolution', 'subdomain');
  } else if (host !== BASE_DOMAIN && host !== `www.${BASE_DOMAIN}`) {
    // Custom domain store
    requestHeaders.set('x-store-domain', host);
    requestHeaders.set('x-store-resolution', 'custom-domain');
  } else {
    // Root domain — no store context
    return NextResponse.next();
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
