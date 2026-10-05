// Shapes of pos-kasir-be's guest ordering endpoints (/guest/*). Written by
// hand: scripts/generate-owner-types.mjs leaves guest endpoints out on purpose.
// Money is rupiah as a plain number; all keys are snake_case.

export interface GuestAddonOption {
  id: number
  name: string
  price: number
}

export interface GuestAddonGroup {
  id: number
  name: string
  is_required: boolean
  max_select: number
  options: GuestAddonOption[]
}

export interface GuestMenuDiscount {
  id: number
  name: string
  percent_off: number
  discount_amount: number
}

export interface GuestMenu {
  id: number
  category_id: number
  category_name: string
  name: string
  description: string
  price: number
  final_price: number
  image_url: string
  is_available: boolean
  is_featured: boolean
  addon_groups: GuestAddonGroup[]
  discount?: GuestMenuDiscount
}

export interface GuestCartItemAddon {
  id: number
  addon_option_id: number
  name: string
  price: number
}

export interface GuestCartItem {
  id: number
  menu_id: number
  menu_name: string
  qty: number
  price: number
  addons: GuestCartItemAddon[]
  addons_total: number
  subtotal: number
  notes: string
  ordered_by: string
}

export interface GuestCart {
  id: number
  status: string
  table_number: string
  items: GuestCartItem[]
  subtotal: number
  tax_percentage: number
  tax_amount: number
  grand_total: number
}

export interface GuestSession {
  guest_session_token: string
  table_session_id: number
  table_id: number
  table_number: string
  expired_at: string
  cart: GuestCart
}

export interface AddCartItemPayload {
  menu_id: number
  qty: number
  notes: string
  ordered_by: string
  addon_option_ids: number[]
}

export interface UpdateCartItemPayload {
  qty: number
  notes: string
  ordered_by: string
  addon_option_ids: number[]
}

export interface CheckoutPayload {
  guest_name: string
  notes: string
}

export interface GuestOrder {
  id: number
  order_no: string
  table_number: string
  status: string
  grand_total: number
}

// pos-kasir-be order statuses (internal/transaction/order). A guest's order
// starts "pending" and the cashier moves it on.
export const FINAL_ORDER_STATUSES = ["selesai", "dibatalkan", "direfund"]

export function isFinalOrder(order: Pick<GuestOrder, "status"> | undefined): boolean {
  return order != null && FINAL_ORDER_STATUSES.includes(order.status)
}
