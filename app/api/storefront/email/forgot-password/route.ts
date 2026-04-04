import { NextRequest, NextResponse } from 'next/server';
import { API_URL, buildExpressHeaders } from '../../_lib/proxy';

export async function POST(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const body = await req.json();

    await fetch(`${API_URL}/api/storefront/customer/forgot-password`, {
      method: 'POST',
      headers: buildExpressHeaders(slug),
      body: JSON.stringify(body),
    });

    // Always return 200 — never reveal if email exists
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // fail silently
  }
}
