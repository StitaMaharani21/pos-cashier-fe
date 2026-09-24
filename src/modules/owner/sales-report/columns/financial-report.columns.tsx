import { format } from "date-fns"
import { EyeIcon } from "lucide-react"

import type { FinancialReportTransaction } from "@/entities/order/model/order-analytics.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

// Soft-tint pill per order type (same "bg-X-50 text-X-600" convention as
// StatusBadge/LowStockCard) so the table is scannable by category at a glance.
const ORDER_TYPE_META: Record<string, { label: string; className: string }> = {
  dine_in: { label: "Dine-in", className: "bg-blue-50 text-blue-600" },
  takeaway: { label: "Takeaway", className: "bg-amber-50 text-amber-600" },
  delivery: { label: "Delivery", className: "bg-purple-50 text-purple-600" },
}

export const financialReportColumns: CrudColumn<FinancialReportTransaction>[] = [
  {
    key: "order_no",
    header: "No. Order",
    render: (row) => <span className="font-medium text-foreground">{row.order_no}</span>,
  },
  {
    key: "created_at",
    header: "Tanggal & Jam",
    render: (row) =>
      row.created_at ? format(new Date(row.created_at), "d MMM yyyy, HH:mm") : "—",
  },
  {
    key: "cashier_name",
    header: "Kasir",
    render: (row) => row.cashier_name || "—",
  },
  {
    key: "table_type",
    header: "Meja / Tipe",
    render: (row) => (
      <div className="flex flex-col gap-1">
        <span>{row.table_number || "—"}</span>
        {row.order_type && (
          <Badge className={cn("w-fit", ORDER_TYPE_META[row.order_type]?.className)}>
            {ORDER_TYPE_META[row.order_type]?.label ?? row.order_type}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "payment_method_name",
    header: "Metode Pembayaran",
    render: (row) => row.payment_method_name || "—",
  },
  {
    key: "item_count",
    header: "Jumlah Item",
    render: (row) => <span className="tabular-nums">{row.item_count ?? 0} Item</span>,
  },
  {
    key: "discount_amount",
    header: "Diskon",
    render: (row) =>
      row.discount_amount ? (
        <span className="tabular-nums text-destructive">
          - {formatRupiah(row.discount_amount)}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "total_paid",
    header: "Total Bayar",
    render: (row) => (
      <span className="font-semibold tabular-nums text-foreground">
        {formatRupiah(row.total_paid ?? 0)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Aksi",
    render: () => (
      <button
        type="button"
        disabled
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground disabled:opacity-50"
        aria-label="Lihat detail"
      >
        <EyeIcon className="size-4" />
      </button>
    ),
  },
]
