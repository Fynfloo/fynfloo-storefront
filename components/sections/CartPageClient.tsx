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

  function recalcTotals(
    items: CartResponse['cart']['items'],
  ): Pick<CartResponse['cart'], 'subtotal' | 'total'> {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { subtotal, total: subtotal };
  }

  // ── Update quantity ──────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantId,
    }: {
      productId: string;
      quantity: number;
      variantId: string | null; // ← added
    }) => updateCartItem(slug, productId, quantity, variantId), // ← pass variantId
    onMutate: async ({ productId, quantity, variantId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', slug] });
      const previous = queryClient.getQueryData<CartResponse>(['cart', slug]);
      queryClient.setQueryData<CartResponse>(['cart', slug], (old) => {
        if (!old?.cart) return old;
        const items = old.cart.items.map((item) =>
          // ← scope optimistic update by both productId AND variantId
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item,
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

  // ── Remove item ──────────────────────────────────────────────────────────────

  const removeMutation = useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string | null; // ← added
    }) => removeCartItem(slug, productId, variantId), // ← pass variantId
    onMutate: async ({ productId, variantId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', slug] });
      const previous = queryClient.getQueryData<CartResponse>(['cart', slug]);
      queryClient.setQueryData<CartResponse>(['cart', slug], (old) => {
        if (!old?.cart) return old;
        // ← scope optimistic remove by both productId AND variantId
        const items = old.cart.items.filter(
          (item) => !(item.productId === productId && item.variantId === variantId),
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

  // ── Pending item tracking ────────────────────────────────────────────────────
  // Use cart item id (unique per line) rather than productId for pending state.
  // productId alone would mark both "Blue Shirt S" and "Blue Shirt M" as pending.
  const pendingItemId = updateMutation.variables
    ? `${updateMutation.variables.productId}:${updateMutation.variables.variantId ?? ''}`
    : removeMutation.variables
      ? `${removeMutation.variables.productId}:${removeMutation.variables.variantId ?? ''}`
      : null;

  return (
    <>
      <CartItems
        data={cartItemsData}
        slug={slug}
        cart={cart}
        isLoading={isLoading}
        onQuantityChange={(
          productId,
          quantity,
          variantId, // ← added variantId
        ) => updateMutation.mutate({ productId, quantity, variantId })}
        onRemove={(
          productId,
          variantId, // ← added variantId
        ) => removeMutation.mutate({ productId, variantId })}
        isPending={updateMutation.isPending || removeMutation.isPending}
        pendingItemId={pendingItemId} // ← renamed from pendingProductId
      />
      <CartSummary data={cartSummaryData} slug={slug} cart={cart} />
    </>
  );
}
