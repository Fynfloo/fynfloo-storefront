import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL, SESSION_COOKIE, IS_PROD, buildExpressHeaders } from '../../_lib/proxy';

export async function POST(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const cartToken = req.headers.get('x-cart-token');
    const body = await req.json();

    const apiRes = await fetch(`${API_URL}/api/storefront/customer/login`, {
      method: 'POST',
      headers: buildExpressHeaders(slug, null, cartToken),
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    // Extract raw token — set as httpOnly cookie on storefront domain
    // The browser never sees the raw token
    const { token, ...clientData } = data;

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json(clientData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
