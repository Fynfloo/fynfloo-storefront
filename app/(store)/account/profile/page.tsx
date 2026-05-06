import { headers, cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { fetchCustomerProfile } from '@/lib/api';
import { ProfileForm } from '@/components/sections/ProfileForm';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const slug = headersList.get('x-store-slug') ?? '';
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? '';

  const profile = await fetchCustomerProfile(slug, token);

  if (!profile) {
    return (
      <div className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-lg text-center py-16">
            <p className="text-[var(--colour-primary)] opacity-40">Unable to load profile.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[var(--colour-primary)]">My account</h1>
          </div>

          <div className="flex gap-6 border-b border-[var(--colour-primary)] border-opacity-10 mb-8">
            {[
              { label: 'Profile', href: '/account/profile', active: true },
              { label: 'Orders', href: '/account/orders', active: false },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pb-3 text-sm font-medium transition-colors
                  ${
                    item.active
                      ? 'text-[var(--colour-primary)] border-b-2 border-[var(--colour-primary)] -mb-px'
                      : 'text-[var(--colour-primary)] opacity-40 hover:opacity-70'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <ProfileForm profile={profile} />
        </div>
      </Container>
    </div>
  );
}
