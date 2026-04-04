import { NextRequest, NextResponse } from 'next/server';
import { API_URL, buildExpressHeaders } from '../../_lib/proxy';

export async function GET(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const token = req.nextUrl.searchParams.get('token') ?? '';
    const uid = req.nextUrl.searchParams.get('uid') ?? '';

    const apiRes = await fetch(
      `${API_URL}/api/storefront/customer/confirm-email?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`,
      { headers: buildExpressHeaders(slug) },
    );

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
