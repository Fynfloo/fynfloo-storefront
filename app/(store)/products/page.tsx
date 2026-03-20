// app/(store)/products/page.tsx
import { PageRenderer } from '@/components/PageRenderer';
import { resolveStorePage } from '@/lib/page';

export default async function ProductsPage() {
  const { store, page, slug } = await resolveStorePage('/products');

  return <PageRenderer sections={page.layout} context={{ storeId: store.id, slug }} />;
}
