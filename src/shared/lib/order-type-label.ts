// Order-type names as the owner reads them, shared by every screen that lists
// them (dashboard composition card, transaction detail).
export const ORDER_TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan di Tempat",
  takeaway: "Dibungkus",
  delivery: "Antar (GoFood, GrabFood)",
}

export function orderTypeLabel(orderType: string | null | undefined): string {
  if (!orderType) return "—"
  return ORDER_TYPE_LABEL[orderType] ?? orderType
}
