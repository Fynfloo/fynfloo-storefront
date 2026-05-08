import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { SignupForm } from '@/components/sections/SignupForm';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  const { next } = await searchParams;
  const destination = next ?? '/account/orders';

  if (token) redirect(destination);

  return <SignupForm next={destination} />;
}
