import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchStoreData } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const store = slug ? await fetchStoreData(slug) : null;
  const name = store?.name ?? 'Store';
  return {
    title: {
      template: `%s — ${name}`,
      default: `Account — ${name}`,
    },
  };
}

// Public account paths — no auth guard applied
// These pages handle their own redirect if the user IS authenticated
const PUBLIC_PATHS = [
  '/account/login',
  '/account/signup',
  '/account/forgot-password',
  '/account/reset-password',
  '/account/confirm-email',
];

/**
 * Account layout — server-side session guard.
 *
 * With the BFF pattern, the storefront-session cookie is set on the
 * storefront domain (my-store.fynfloo.com or mybrand.com) by the
 * Next.js login API route. It is now visible here via cookies() from
 * next/headers — this was not possible before BFF.
 *
 * Public auth pages (login, signup, etc.) are excluded from the guard.
 * They live at the same path level but handle their own logic:
 *   - Unauthenticated: render the form
 *   - Authenticated: redirect to /account/orders
 *
 * Protected pages (profile, orders) redirect to login if no cookie.
 * This is a presence check — validity is enforced by the BFF routes
 * which return 401 if the session is expired or revoked.
 *
 * Why server-side works now:
 *   Before BFF: cookie on api.fynfloo.com — invisible to Next.js server
 *   After BFF:  cookie on storefront domain — readable via cookies() ✅
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // Skip guard for public auth pages
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    const cookieStore = await cookies();
    const session = cookieStore.get('storefront-session');

    if (!session) {
      const next = pathname || '/account/orders';
      redirect(`/account/login?next=${encodeURIComponent(next)}`);
    }
  }

  return <>{children}</>;
}
