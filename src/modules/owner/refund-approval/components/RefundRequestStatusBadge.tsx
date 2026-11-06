import type { RefundRequestStatus } from "@/entities/refund-request/model/refund-request.types"
import { cn } from "@/shared/lib/utils"

const STATUS: Record<RefundRequestStatus, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  approved: { label: "Disetujui", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  rejected: { label: "Ditolak", className: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400" },
  cancelled: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
}

export function RefundRequestStatusBadge({ status }: { status: RefundRequestStatus }) {
  const { label, className } = STATUS[status] ?? STATUS.cancelled
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap", className)}>
      {label}
    </span>
  )
}
