// app/(store)/products/[handle]/page.tsx
import type { Metadata } from 'next';
import { PageRenderer } from '@/components/PageRenderer';
import { resolveProductPage } from '@/lib/page';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const { store, product } = await resolveProductPage(handle);

  const meta = product.metadata as { metaTitle?: string; metaDescription?: string } | null;

  const title = meta?.metaTitle || product.title;
  const description =
    meta?.metaDescription || product.description || `Shop ${product.title} at ${store.name}`;

  return {
    title: `${title} — ${store.name}`,
    description,
    openGraph: {
      title,
      description,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
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
