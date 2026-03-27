// app/(store)/page.tsx
import { PageRenderer } from '@/components/PageRenderer';
import { resolveStorePage } from '@/lib/page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await resolveStorePage('/');
  return {
    title: store.name,
    description: `Shop at ${store.name}`,
    openGraph: { title: store.name },
  };
}

export default async function StorePage() {
  const { store, page, slug } = await resolveStorePage('/');

  return <PageRenderer sections={page.layout} context={{ storeId: store.id, slug, store }} />;
}
