// lib/cart.ts
'use client';

const CART_TOKEN_KEY = 'fynfloo-cart-token';

export function getCartToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${CART_TOKEN_KEY}=`));
  return match ? match.split('=')[1] : null;
}

export function setCartToken(token: string): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${CART_TOKEN_KEY}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}
