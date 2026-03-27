// app/(store)/products/page.tsx
import { PageRenderer } from '@/components/PageRenderer';
import { resolveStorePage } from '@/lib/page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await resolveStorePage('/products');
  return {
    title: `Products — ${store.name}`,
    description: `Browse all products at ${store.name}`,
    openGraph: { title: `Products — ${store.name}` },
  };
}

export default async function ProductsPage() {
  const { store, page, slug } = await resolveStorePage('/products');

  return <PageRenderer sections={page.layout} context={{ storeId: store.id, slug, store }} />;
}
