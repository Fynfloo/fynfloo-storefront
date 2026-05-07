import type { FeaturedCarouselData, StoreData } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { FeaturedCarousel } from './FeaturedCarousel';

interface FeaturedCarouselServerProps {
  data: FeaturedCarouselData;
  slug: string;
  store: StoreData;
}

export async function FeaturedCarouselServer({ data, slug, store }: FeaturedCarouselServerProps) {
  const products = await fetchProducts(slug, data.collectionHandle ?? undefined);
  return <FeaturedCarousel data={data} products={products} currency={store.currency} />;
}
