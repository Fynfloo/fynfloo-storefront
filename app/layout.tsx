import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { buildThemeCSS } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Store',
  description: 'Powered by Fynfloo',
};

async function getStoreData(slug: string | null, domain: string | null) {
  if (!slug && !domain) return null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

    // Subdomain resolution — GET /api/storefront/stores/:slug
    // Custom domain resolution handled in Step 17
    const identifier = slug ?? domain;
    const res = await fetch(`${apiUrl}/api/storefront/stores/${identifier}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const domain = headersList.get('x-store-domain');

  const store = await getStoreData(slug, domain);
  const themeCSS = buildThemeCSS(store?.themeSettings ?? {});

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
