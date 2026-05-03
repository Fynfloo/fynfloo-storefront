// app/api/storefront/payments/order-by-session/route.ts
//
// BFF route for the checkout success page.
// Proxies to GET /api/payments/storefront/order-by-session/:sessionId on the API.
//
// No auth required — the session_id from Stripe is the credential.
// The API validates it belongs to this store via metadata.storeId.
//
// Returns:
//   { status: 'confirmed', order: {...}, customerEmail, customerName }
//   { status: 'processing', order: null, customerEmail, customerName }

import { NextRequest, NextResponse } from 'next/server';
import { API_URL, buildExpressHeaders } from '../../_lib/proxy';

export async function GET(req: NextRequest) {
  try {
    const slug = req.headers.get('x-store-slug') ?? '';
    const sessionId = req.nextUrl.searchParams.get('sessionId') ?? '';

    console.log('order-by-session BFF:', {
      slug,
      sessionId,
      allHeaders: Object.fromEntries(req.headers.entries()),
    });

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // No auth — session_id is the credential. No cookie required.
    // buildExpressHeaders without a token still sends X-Store-Slug.
    const apiRes = await fetch(
      `${API_URL}/api/payments/storefront/order-by-session/${encodeURIComponent(sessionId)}`,
      { headers: buildExpressHeaders(slug, undefined, null) },
    );

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
