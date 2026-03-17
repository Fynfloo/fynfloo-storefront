// app/layout.tsx
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { buildThemeCSS } from '@/lib/theme';
import { fetchStoreData } from '@/lib/api';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Store',
  description: 'Powered by Fynfloo',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const domain = headersList.get('x-store-domain');

  const identifier = slug ?? domain;
  const store = identifier ? await fetchStoreData(identifier) : null;
  const themeCSS = buildThemeCSS(store?.themeSettings ?? {});

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className="flex flex-col min-h-screen bg-[var(--colour-bg,#ffffff)]">
        {store && slug && <Nav store={store} slug={slug} />}
        <main className="flex-1">{children}</main>
        {store && <Footer store={store} />}
      </body>
    </html>
  );
}
