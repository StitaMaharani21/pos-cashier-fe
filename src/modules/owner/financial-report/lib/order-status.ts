import type { RefundStatus } from "@/modules/owner/financial-report/financial-report.types"

// Status badge for a transaction row. The order status and the refund status
// are separate things: an order stays "selesai" while only part of it was
// refunded, and only becomes "direfund" once every item has been returned.
// Badge precedence: cancelled > fully refunded > partially refunded > the
// plain order status.
//
// Soft-tint convention: "bg-X-50 text-X-600 dark:bg-X-950/50 dark:text-X-400".
// Order status values are the raw strings the backend stores
// (internal/transaction/order/order_service.go) — unknown ones fall back to a
// muted badge showing the raw value instead of disappearing.
export interface StatusBadgeMeta {
  label: string
  className: string
}

const MUTED = "bg-muted text-muted-foreground"

const ORDER_STATUS_META: Record<string, StatusBadgeMeta> = {
  selesai: { label: "Selesai", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  diproses: { label: "Diproses", className: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  pending: { label: "Menunggu", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  dibatalkan: { label: "Dibatalkan", className: "bg-destructive/10 text-destructive" },
  direfund: { label: "Direfund Penuh", className: MUTED },
}

const PARTIAL_REFUND_META: StatusBadgeMeta = {
  label: "Sebagian Direfund",
  className: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
}

export function orderStatusBadge(status: string | undefined, refundStatus: RefundStatus | undefined): StatusBadgeMeta {
  const key = status?.toLowerCase() ?? ""
  if (key === "dibatalkan") return ORDER_STATUS_META.dibatalkan
  if (refundStatus === "full" || key === "direfund") return ORDER_STATUS_META.direfund
  if (refundStatus === "partial") return PARTIAL_REFUND_META
  return ORDER_STATUS_META[key] ?? { label: status || "—", className: MUTED }
}
