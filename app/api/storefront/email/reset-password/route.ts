import { NextRequest, NextResponse } from 'next/server';
import { API_URL, buildExpressHeaders } from '../../_lib/proxy';

export async function POST(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const body = await req.json();

    const apiRes = await fetch(`${API_URL}/api/storefront/customer/reset-password`, {
      method: 'POST',
      headers: buildExpressHeaders(slug),
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
