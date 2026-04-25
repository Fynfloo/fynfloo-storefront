// app/(store)/coming-soon/page.tsx
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchStoreData } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const store = slug ? await fetchStoreData(slug) : null;

  return {
    title: store?.name ? `Coming Soon — ${store.name}` : 'Coming Soon',
    description: `${store?.name ?? 'This store'} is getting ready — check back soon.`,
    openGraph: {
      title: store?.name ? `Coming Soon — ${store.name}` : 'Coming Soon',
    },
  };
}

export default async function ComingSoonPage() {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const store = slug ? await fetchStoreData(slug) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {store?.name && (
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-6"
          style={{ color: 'var(--colour-primary)' }}
        >
          {store.name}
        </p>
      )}
      <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--colour-primary)' }}>
        We&apos;re getting ready
      </h1>
      <p className="text-base max-w-sm" style={{ color: 'var(--colour-primary)', opacity: 0.6 }}>
        Something exciting is on its way. Check back soon.
      </p>
    </div>
  );
}
