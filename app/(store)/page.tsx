// app/(store)/page.tsx
import { PageRenderer } from '@/components/PageRenderer';
import { resolveStorePage } from '@/lib/page';

export default async function StorePage() {
  const { store, page, slug } = await resolveStorePage('/');

  return <PageRenderer sections={page.layout} context={{ storeId: store.id, slug }} />;
}
