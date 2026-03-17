const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  slug?: string;
  cartToken?: string;
}

/**
 * Typed API client for the Fynfloo backend.
 * Automatically attaches X-Store-Slug and X-Cart-Token headers
 * on every request.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { slug, cartToken, headers, ...rest } = options;

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (slug) {
    mergedHeaders['X-Store-Slug'] = slug;
  }

  if (cartToken) {
    mergedHeaders['X-Cart-Token'] = cartToken;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
