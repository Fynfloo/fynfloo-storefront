import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchStoreData } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get('x-store-slug');
  const store = slug ? await fetchStoreData(slug) : null;
  const name = store?.name ?? 'Store';
  return {
    title: {
      template: `%s — ${name}`,
      default: `Account — ${name}`,
    },
  };
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
