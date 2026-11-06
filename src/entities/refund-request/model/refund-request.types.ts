// pos-kasir-be's internal/transaction/refund (GET /refund-requests, POST
// /refund-requests/:id/approve|reject). Written by hand, like entities/menu-addon:
// the owner schema generator's allow-list doesn't include this endpoint yet.

export type RefundRequestStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface RefundRequestItem {
  id: number
  order_item_id: number
  menu_name: string
  qty: number
  // Value of the item (before tax).
  amount: number
}

// A refund the cashier asked for. Nothing (stock, cash, order status) changes until
// the owner approves it.
export interface RefundRequest {
  id: number
  request_no: string
  order_id: number
  order_no: string
  trx_no: string
  status: RefundRequestStatus
  // Required, at least 5 characters.
  reason: string
  // The cashier ticked "kembalikan stok" (the goods are still sellable).
  restore_stock: boolean
  // Estimated money back when it was submitted; the real amount is computed on approval.
  total_amount: number
  items: RefundRequestItem[]
  requested_by: number
  requested_by_name: string
  decided_by?: number
  decided_at?: string
  // Required when rejecting, optional when approving.
  decision_note: string
  // The refund created on approval.
  refund_id?: number
  created_at: string
}
