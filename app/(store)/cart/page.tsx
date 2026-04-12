// app/(store)/cart/page.tsx
import { resolveStorePage, findSection } from '@/lib/page';
import { CartPageClient } from '@/components/sections/CartPageClient';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await resolveStorePage('/cart');
  return {
    title: `Your Cart — ${store.name}`,
    openGraph: { title: `Your Cart — ${store.name}` },
  };
}

export default async function CartPage() {
  const { page, slug } = await resolveStorePage('/cart');

  // findSection narrows the discriminated union — data is fully typed, no cast needed
  const cartItemsSection = findSection(page.layout, 'checkout.cartItems');
  const cartSummarySection = findSection(page.layout, 'checkout.cartSummary');

  return (
    <CartPageClient
      slug={slug}
      cartItemsData={cartItemsSection?.data ?? { showThumbnails: true, showLineTotals: true }}
      cartSummaryData={cartSummarySection?.data ?? { showDiscountCode: true }}
    />
  );
}
