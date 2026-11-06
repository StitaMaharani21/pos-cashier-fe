import { format } from "date-fns"

import type { RefundRequest } from "@/entities/refund-request/model/refund-request.types"
import { RefundRequestStatusBadge } from "@/modules/owner/refund-approval/components/RefundRequestStatusBadge"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"

function formatWhen(value?: string): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd/MM/yyyy HH:mm")
}

// Columns of the "Persetujuan Refund" table. The actions column is added by the
// section (it needs the dialogs' open state).
export const refundRequestColumns: CrudColumn<RefundRequest>[] = [
  {
    key: "request",
    header: "Pengajuan",
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{row.request_no}</span>
        <span className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</span>
      </div>
    ),
  },
  {
    key: "order",
    header: "Pesanan",
    render: (row) => <span className="font-medium">{row.trx_no || row.order_no || `#${row.order_id}`}</span>,
  },
  { key: "requested_by", header: "Diajukan oleh", render: (row) => row.requested_by_name || "—" },
  {
    key: "items",
    header: "Item",
    className: "whitespace-normal",
    render: (row) => (
      <span className="text-sm">
        {row.items.map((item) => `${item.menu_name} ×${item.qty}`).join(", ") || "—"}
      </span>
    ),
  },
  {
    key: "reason",
    header: "Alasan",
    className: "max-w-[260px] whitespace-normal",
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{row.reason}</span>
        {row.status === "rejected" && row.decision_note && (
          <span className="text-xs text-red-600 dark:text-red-400">Ditolak: {row.decision_note}</span>
        )}
        {row.status === "approved" && row.decision_note && (
          <span className="text-xs text-muted-foreground">Catatan: {row.decision_note}</span>
        )}
      </div>
    ),
  },
  {
    key: "total",
    header: "Perkiraan Uang Kembali",
    align: "right",
    render: (row) => (
      <div className="flex flex-col items-end">
        <span className="tabular-nums">{formatRupiah(row.total_amount)}</span>
        {row.restore_stock && <span className="text-xs text-muted-foreground">Stok dikembalikan</span>}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <div className="flex flex-col items-start gap-0.5">
        <RefundRequestStatusBadge status={row.status} />
        {row.status !== "pending" && <span className="text-xs text-muted-foreground">{formatWhen(row.decided_at)}</span>}
      </div>
    ),
  },
]
