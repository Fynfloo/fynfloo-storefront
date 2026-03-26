// app/(store)/products/[handle]/page.tsx
import { PageRenderer } from '@/components/PageRenderer';
import { resolveProductPage } from '@/lib/page';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const { store, page, slug, product } = await resolveProductPage(handle);

  return (
    <PageRenderer
      sections={page.layout}
      context={{ storeId: store.id, slug, store, product, productId: product.id }}
    />
  );
}
