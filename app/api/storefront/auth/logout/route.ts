import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL, SESSION_COOKIE, IS_PROD, buildExpressHeaders } from '../../_lib/proxy';

export async function POST(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const cartToken = req.headers.get('x-cart-token');

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await fetch(`${API_URL}/api/storefront/customer/logout`, {
        method: 'POST',
        headers: buildExpressHeaders(slug, token, cartToken),
      }).catch(() => {});
    }

    // Clear cookie — must match set options exactly
    cookieStore.set(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
