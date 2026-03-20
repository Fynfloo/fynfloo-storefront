// components/sections/CartPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Cart, CartItemsData, CartSummaryData } from '@/lib/types';
import { fetchCart } from '@/lib/storefront-client';
import { CartItems } from './CartItems';
import { CartSummary } from './CartSummary';

interface CartPageClientProps {
  slug: string;
  cartItemsData: CartItemsData;
  cartSummaryData: CartSummaryData;
}

export function CartPageClient({ slug, cartItemsData, cartSummaryData }: CartPageClientProps) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    fetchCart(slug).then((res) => setCart(res?.cart ?? null));
  }, [slug]);

  return (
    <>
      <CartItems data={cartItemsData} slug={slug} cart={cart} onCartChange={setCart} />
      <CartSummary data={cartSummaryData} slug={slug} cart={cart} />
    </>
  );
}
