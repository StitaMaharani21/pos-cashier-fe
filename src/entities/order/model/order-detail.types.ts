// GET /orders/{id}/detail — one order with its items, summary and payment
// (pos-kasir-be internal/transaction/order/dto/order_dto.go,
// OrderDetailResponse). Hand-written: the generated owner-schema doesn't
// include this path (see scripts/generate-owner-types.mjs allow-list).

export interface OrderDetailAddon {
  id: number
  addon_id: number
  name: string
  price: number
}

export interface OrderDetailItem {
  id: number
  menu_id: number
  menu_name: string
  qty: number
  price: number
  notes: string
  addons: OrderDetailAddon[]
  addons_total: number
  discount_amount: number
  subtotal: number
  // How many units of this line were already refunded (0 = untouched).
  refunded_qty: number
}

export interface OrderDetailPayment {
  id: number
  status: string
  payment_method_id: number
  payment_method_name: string
  payment_method_type: string
  amount: number
  amount_received: number
  change_amount: number
  payment_reference: string
  paid_at: string
  surcharge_amount: number
  mdr_percent: number
  mdr_amount: number
  card_type?: string
  payment_channel_name?: string
  // Gateway provider of the method (e.g. "midtrans" = dynamic QRIS).
  payment_provider?: string
}

export interface OrderDetailSummary {
  subtotal: number
  discount_amount: number
  tax_percent: number
  tax_amount: number
  grand_total: number
}

export interface OrderDetail {
  id: number
  order_no: string
  trx_no: string
  order_type: string
  table_number: string
  guest_name: string
  cashier_name: string
  status: string
  notes: string
  created_at: string
  cancel_reason?: string
  refund_reason?: string
  // null while the order is unpaid.
  payment: OrderDetailPayment | null
  items: OrderDetailItem[]
  summary: OrderDetailSummary
}
