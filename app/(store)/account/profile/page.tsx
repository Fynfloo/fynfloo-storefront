import { headers, cookies } from 'next/headers';
import type { Metadata } from 'next';
import { SESSION_COOKIE } from '@/app/api/storefront/_lib/proxy';
import { fetchCustomerProfile } from '@/lib/api';
import { ProfileForm } from '@/components/sections/ProfileForm';
import { AccountShell } from '@/components/ui/AccountShell';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const slug = headersList.get('x-store-slug') ?? '';
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? '';

  const profile = await fetchCustomerProfile(slug, token);

  if (!profile) {
    return (
      <AccountShell profile={null} activeTab="profile">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-sm text-[var(--colour-primary)]/40">Unable to load profile.</p>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell profile={profile} activeTab="profile">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-[var(--colour-primary)]">Profile</h1>
        <ProfileForm profile={profile} />
      </div>
    </AccountShell>
  );
}
