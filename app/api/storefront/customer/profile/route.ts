import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../_lib/proxy';
import { fetchCustomerProfile, updateCustomerProfile } from '@/lib/api';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const profile = await fetchCustomerProfile(slug, token);
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await req.json();
    const profile = await updateCustomerProfile(slug, token, body);
    if (!profile) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
