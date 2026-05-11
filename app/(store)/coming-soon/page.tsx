import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchStoreData } from '@/lib/api';
import { ComingSoonView } from '@/components/ui/ComingSoonView';

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

  return <ComingSoonView store={store} />;
}
