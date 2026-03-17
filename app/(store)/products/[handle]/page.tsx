// app/(store)/products/[handle]/page.tsx
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import { fetchStoreData, fetchStorePage, fetchProduct } from '@/lib/api';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');

  if (!slug) notFound();

  const [store, page, product] = await Promise.all([
    fetchStoreData(slug),
    fetchStorePage(slug, '/products/[handle]'),
    fetchProduct(slug, handle),
  ]);

  if (!store || !page || !product) notFound();

  return (
    <>
      <PageRenderer
        sections={page.layout}
        context={{
          storeId: store.id,
          slug,
          product,
          productId: product.id,
        }}
      />
    </>
  );
}
