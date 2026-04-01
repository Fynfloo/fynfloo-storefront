// components/sections/CartPageClient.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CartItemsData, CartSummaryData, CartResponse } from '@/lib/types';
import { fetchCart, updateCartItem, removeCartItem } from '@/lib/storefront-client';
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

  // Recalculate totals on the client for optimistic updates, since the API doesn't return them
  function recalcTotals(
    items: CartResponse['cart']['items'],
  ): Pick<CartResponse['cart'], 'subtotal' | 'total'> {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { subtotal, total: subtotal };
  }

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(slug, productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', slug] });
      const previous = queryClient.getQueryData<CartResponse>(['cart', slug]);
      queryClient.setQueryData<CartResponse>(['cart', slug], (old) => {
        if (!old?.cart) return old;
        const items = old.cart.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        );
        return { ...old, cart: { ...old.cart, items, ...recalcTotals(items) } };
      });
      return { previous };
    },
    onError: (_err, _vars, context: { previous: CartResponse | undefined } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData<CartResponse>(['cart', slug], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', slug] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) => removeCartItem(slug, productId),
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', slug] });
      const previous = queryClient.getQueryData<CartResponse>(['cart', slug]);
      queryClient.setQueryData<CartResponse>(['cart', slug], (old) => {
        if (!old?.cart) return old;
        const items = old.cart.items.filter((item) => item.productId !== productId);
        return { ...old, cart: { ...old.cart, items, ...recalcTotals(items) } };
      });
      return { previous };
    },
    onError: (_err, _vars, context: { previous: CartResponse | undefined } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData<CartResponse>(['cart', slug], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', slug] });
    },
  });

  return (
    <>
      <CartItems
        data={cartItemsData}
        slug={slug}
        cart={cart}
        isLoading={isLoading}
        onQuantityChange={(productId, quantity) => updateMutation.mutate({ productId, quantity })}
        onRemove={(productId) => removeMutation.mutate({ productId })}
        isPending={updateMutation.isPending || removeMutation.isPending}
        pendingProductId={
          updateMutation.variables?.productId ?? removeMutation.variables?.productId ?? null
        }
      />
      <CartSummary data={cartSummaryData} slug={slug} cart={cart} />
    </>
  );
}
