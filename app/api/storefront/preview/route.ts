import { NextRequest, NextResponse } from 'next/server';
import { IS_PROD, STOREFRONT_PREVIEW_COOKIE } from '../_lib/proxy';

function normalizePreviewPath(rawPath: string | null): string {
  if (!rawPath) return '/';
  if (!rawPath.startsWith('/') || rawPath.startsWith('//')) {
    return '/';
  }

  return rawPath;
}

function buildPreviewRedirectUrl(req: NextRequest, path: string): URL {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost ?? req.headers.get('host');

  if (host) {
    const protocol = forwardedProto ?? req.nextUrl.protocol.replace(':', '');
    return new URL(`${protocol}://${host}${path}`);
  }

  return new URL(path, req.nextUrl.origin);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const path = normalizePreviewPath(req.nextUrl.searchParams.get('path'));
  const redirectUrl = buildPreviewRedirectUrl(req, path);

  if (!token) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(STOREFRONT_PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return response;
}
