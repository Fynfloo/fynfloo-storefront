// app/(store)/page.tsx
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import { fetchStoreData, fetchStorePage } from '@/lib/api';

export default async function StorePage() {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');

  if (!slug) notFound();

  const [store, page] = await Promise.all([fetchStoreData(slug), fetchStorePage(slug, '/')]);

  if (!store || !page) notFound();

  return (
    <>
      <PageRenderer sections={page.layout} context={{ storeId: store.id, slug }} />
    </>
  );
}
