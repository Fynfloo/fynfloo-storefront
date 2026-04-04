import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL, SESSION_COOKIE, buildExpressHeaders } from '../../_lib/proxy';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const cartToken = req.headers.get('x-cart-token');
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const apiRes = await fetch(`${API_URL}/api/storefront/customer/profile`, {
      headers: buildExpressHeaders(slug, token, cartToken),
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const cartToken = req.headers.get('x-cart-token');
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await req.json();

    const apiRes = await fetch(`${API_URL}/api/storefront/customer/profile`, {
      method: 'PATCH',
      headers: buildExpressHeaders(slug, token, cartToken),
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
