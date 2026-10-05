import { useMutation, useQuery } from "@tanstack/react-query"

import { isFinalOrder, type CheckoutPayload } from "@/modules/public/self-order/domain/self-order.types"
import type { GuestContext } from "@/modules/public/self-order/infrastructure/guest-client"
import { checkoutCart, getOrder } from "@/modules/public/self-order/infrastructure/self-order.api"

const ORDER_POLL_MS = 5000

// "Kirim ke Kasir": turns the table's cart into an order that waits for the
// cashier's approval (status "pending").
export function useCheckout(ctx: GuestContext, cartId: number) {
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkoutCart(ctx, cartId, payload),
  })
}

// Follows the order the cashier is handling until it reaches a final status.
export function useOrderStatus(ctx: GuestContext, orderId: number | null) {
  return useQuery({
    queryKey: ["guest-order", orderId],
    queryFn: () => getOrder(ctx, orderId as number),
    enabled: orderId != null,
    refetchInterval: (query) => (isFinalOrder(query.state.data) ? false : ORDER_POLL_MS),
    refetchIntervalInBackground: true,
    retry: false,
  })
}
