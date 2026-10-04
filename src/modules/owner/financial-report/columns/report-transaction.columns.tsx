import { format } from "date-fns"

import type { ReportTransaction } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

// Soft-tint pill per status, same "bg-X-50 text-X-600" convention as
// sales-report's financial-report.columns.tsx ORDER_TYPE_META. Values match
// the raw status strings the backend actually stores/returns verbatim
// (internal/transaction/order/order_service.go: StatusPending="pending",
// StatusProcessing="diproses", StatusCompleted="selesai",
// StatusCancelled="dibatalkan") — not translated English labels. Unknown/
// future status strings fall back to a muted badge with the raw value
// instead of disappearing.
const STATUS_META: Record<string, { label: string; className: string }> = {
  selesai: { label: "Selesai", className: "bg-emerald-50 text-emerald-600" },
  diproses: { label: "Diproses", className: "bg-blue-50 text-blue-600" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  dibatalkan: { label: "Dibatalkan", className: "bg-destructive/10 text-destructive" },
}

export const reportTransactionColumns: CrudColumn<ReportTransaction>[] = [
  {
    key: "order_no",
    header: "No. Order",
    render: (row) => <span className="font-medium text-foreground">{row.order_no}</span>,
  },
  {
    key: "created_at",
    header: "Tanggal & Jam",
    render: (row) => (row.created_at ? format(new Date(row.created_at), "d MMM yyyy, HH:mm") : "—"),
  },
  {
    key: "cashier_name",
    header: "Kasir",
    render: (row) => row.cashier_name || "—",
  },
  {
    key: "item_count",
    header: "Jumlah Item",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.item_count ?? 0} Item</span>,
  },
  {
    key: "payment_method_name",
    header: "Metode Bayar",
    render: (row) => row.payment_method_name || "—",
  },
  {
    key: "discount_amount",
    header: "Diskon",
    align: "right",
    render: (row) =>
      row.discount_amount ? (
        <span className="tabular-nums text-destructive">- {formatRupiah(row.discount_amount)}</span>
      ) : (
        "—"
      ),
  },
  {
    key: "grand_total",
    header: "Total",
    align: "right",
    render: (row) => (
      <span className="font-semibold tabular-nums text-foreground">
        {formatRupiah(row.grand_total ?? 0)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const meta = STATUS_META[row.status?.toLowerCase()]
      return (
        <Badge className={cn("w-fit", meta?.className ?? "bg-muted text-muted-foreground")}>
          {meta?.label ?? row.status ?? "—"}
        </Badge>
      )
    },
  },
]
