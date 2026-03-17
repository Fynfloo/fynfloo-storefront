// app/(store)/layout.tsx
import { headers } from 'next/headers';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
