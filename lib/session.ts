'use client';

// ─── Customer session token ───────────────────────────────────────────────────
//
// The API sets an httpOnly cookie (storefront-session) on login.
// In production this cookie is sent automatically on every request.
//
// In development the storefront (localhost:3000) and API (localhost:8080)
// are on different ports — browsers treat this as cross-origin.
// sameSite:none cookies require secure:true which requires HTTPS.
// On localhost we have no HTTPS so the cookie is blocked.
//
// Solution: the API also returns the raw session token in the login
// response body. We store it in localStorage and send it as the
// X-Session-Token header on all authenticated requests.
// The backend reads X-Session-Token as a fallback when the cookie
// is absent.
//
// This is safe because:
// - localStorage is scoped to the origin (localhost:3000)
// - The token is the same value as the httpOnly cookie
// - In production the cookie path is used — localStorage is unused
// - XSS risk is the same as any localStorage token — mitigated by CSP

const SESSION_TOKEN_KEY = 'fynfloo-session-token';

export function getSessionToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // Storage may be blocked (private browsing etc.) — fail silently
  }
}

export function clearSessionToken(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Fail silently
  }
}
