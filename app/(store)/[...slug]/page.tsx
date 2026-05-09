import { Metadata } from 'next';
import { PageRenderer } from '@/components/PageRenderer';
import { resolveStorePage } from '@/lib/page';

type ContentPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

function buildPath(segments: string[]): string {
  return `/${segments.join('/')}`;
}

function formatTitle(segments: string[]): string {
  return segments
    .map((segment) =>
      segment
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    )
    .filter(Boolean)
    .join(' / ');
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = buildPath(slug);
  const { store } = await resolveStorePage(path);
  const title = formatTitle(slug);

  return {
    title: title ? `${title} — ${store.name}` : store.name,
    description: title ? `Explore ${title} at ${store.name}` : `Explore ${store.name}`,
    openGraph: {
      title: title ? `${title} — ${store.name}` : store.name,
    },
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const path = buildPath(slug);
  const { store, page, slug: storeSlug } = await resolveStorePage(path);

  return <PageRenderer sections={page.layout} context={{ storeId: store.id, slug: storeSlug, store }} />;
}
