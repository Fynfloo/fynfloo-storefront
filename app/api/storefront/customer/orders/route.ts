import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../_lib/proxy';
import { fetchCustomerOrders } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const orders = await fetchCustomerOrders(slug, token);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
