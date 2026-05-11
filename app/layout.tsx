import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import './globals.css';
import { buildThemeCSS } from '@/lib/theme';
import { fetchStoreData, fetchCustomerProfile } from '@/lib/api';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { PreviewSelectableBox } from '@/components/editor/SiteEditorPreviewProvider';
import { Providers } from './providers';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const identifier = slug ?? headersList.get('x-store-domain');
  const store = identifier ? await fetchStoreData(identifier) : null;

  return {
    title: store?.name ?? 'Store',
    description: `Shop at ${store?.name ?? 'our store'} — powered by Fynfloo`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const domain = headersList.get('x-store-domain');

  const identifier = slug ?? domain;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? null;

  const store = identifier ? await fetchStoreData(identifier) : null;
  const effectiveSlug = slug ?? store?.slug ?? null;
  const profile = token && effectiveSlug ? await fetchCustomerProfile(effectiveSlug, token) : null;

  // Store is offline — redirect all pages to coming soon.
  // Excludes /coming-soon itself to prevent redirect loop.
  const pathname = headersList.get('x-pathname') ?? '';
  const isInactive = store?.status === 'INACTIVE';

  if (isInactive && pathname !== '/coming-soon') {
    redirect('/coming-soon');
  }

  const themeCSS = buildThemeCSS(store?.themeSettings ?? {});
  const showChrome = store && slug && !isInactive;

  return (
    <html lang="en" data-slug={slug ?? ''} data-currency={store?.currency ?? 'GBP'}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className="flex flex-col min-h-screen bg-[var(--colour-bg,#ffffff)]">
        <Providers>
          {showChrome && <Nav store={store} slug={slug} profile={profile} />}
          <main className="flex-1">{children}</main>
          {showChrome && (
            <PreviewSelectableBox nodeId="shared:footer">
              <Footer store={store} />
            </PreviewSelectableBox>
          )}
        </Providers>
      </body>
    </html>
  );
}
