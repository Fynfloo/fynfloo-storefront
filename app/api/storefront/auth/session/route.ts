import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL, SESSION_COOKIE, buildExpressHeaders } from '../../_lib/proxy';

export async function GET(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const cartToken = req.headers.get('x-cart-token');

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const apiRes = await fetch(`${API_URL}/api/storefront/customer/profile`, {
      headers: buildExpressHeaders(slug, token, cartToken),
    });

    if (!apiRes.ok) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
