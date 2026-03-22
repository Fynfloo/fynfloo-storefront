// components/sections/CartPageClient.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CartItemsData, CartSummaryData } from '@/lib/types';
import { fetchCart, updateCartItem } from '@/lib/storefront-client';
import { CartItems } from './CartItems';
import { CartSummary } from './CartSummary';

interface CartPageClientProps {
  slug: string;
  cartItemsData: CartItemsData;
  cartSummaryData: CartSummaryData;
}

export function CartPageClient({ slug, cartItemsData, cartSummaryData }: CartPageClientProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cart', slug],
    queryFn: () => fetchCart(slug),
    staleTime: 30 * 1000,
  });

  const cart = data?.cart ?? null;

  const mutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(slug, productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', slug] });
    },
    onError: (err: Error) => {
      if (err.message.includes('409')) {
        queryClient.invalidateQueries({ queryKey: ['cart', slug] });
      }
    },
  });

  return (
    <>
      <CartItems
        data={cartItemsData}
        slug={slug}
        cart={cart}
        isLoading={isLoading}
        onQuantityChange={(productId, quantity) => mutation.mutate({ productId, quantity })}
        isPending={mutation.isPending}
        pendingProductId={mutation.variables?.productId ?? null}
      />
      <CartSummary data={cartSummaryData} slug={slug} cart={cart} />
    </>
  );
}
