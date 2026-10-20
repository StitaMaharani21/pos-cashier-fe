import type { components } from "@/shared/api/generated/owner-schema"

// Owner dashboard "Total Refund" widget — today's refunds only, no
// comparison vs. yesterday. See pos-kasir-be's
// internal/transaction/refund/dto/refund_dto.go.
export type RefundSummaryToday = components["schemas"]["dto.RefundSummaryResponse"]

// GET /orders/{id}/refunds — every refund processed for one order, oldest
// first. Hand-written (not in the generated schema). `total_amount` is what
// went back to the customer: the items' value plus their share of the tax, so
// the tax part of a refund is `total_amount - sum(items.amount)`.
export interface OrderRefundItem {
  id: number
  order_item_id: number
  menu_name: string
  qty: number
  // Item value only, tax excluded.
  amount: number
}

export interface OrderRefund {
  id: number
  refund_no: string
  order_id: number
  type: "full" | "partial"
  reason: string
  total_amount: number
  items: OrderRefundItem[]
  created_at: string
}
