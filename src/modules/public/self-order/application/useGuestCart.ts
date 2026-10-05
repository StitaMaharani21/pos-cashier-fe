import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  AddCartItemPayload,
  GuestCart,
  UpdateCartItemPayload,
} from "@/modules/public/self-order/domain/self-order.types"
import type { GuestContext } from "@/modules/public/self-order/infrastructure/guest-client"
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/modules/public/self-order/infrastructure/self-order.api"

// Everyone at the table shares this cart, so it is re-read often to pick up
// what the other phones add.
const CART_POLL_MS = 5000

const cartKey = (cartId: number) => ["guest-cart", cartId] as const

// `initial` is the cart the session was resolved with, so the first paint
// needs no extra round trip. Totals (tax, grand total) are the server's.
export function useGuestCart(ctx: GuestContext, initial: GuestCart, enabled: boolean) {
  return useQuery({
    queryKey: cartKey(initial.id),
    queryFn: () => getCart(ctx, initial.id),
    initialData: initial,
    enabled,
    refetchInterval: CART_POLL_MS,
    retry: false,
  })
}

export function useCartActions(ctx: GuestContext, cartId: number) {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: cartKey(cartId) })

  const add = useMutation({
    mutationFn: (payload: AddCartItemPayload) => addCartItem(ctx, cartId, payload),
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: number; payload: UpdateCartItemPayload }) =>
      updateCartItem(ctx, cartId, itemId, payload),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (itemId: number) => removeCartItem(ctx, cartId, itemId),
    onSuccess: refresh,
  })

  return { add, update, remove }
}
