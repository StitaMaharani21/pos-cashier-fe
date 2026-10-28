import { format } from "date-fns"
import { EyeIcon } from "lucide-react"

import { paymentLabelOfRow } from "@/modules/owner/financial-report/lib/payment-label"
import { orderStatusBadge } from "@/modules/owner/financial-report/lib/order-status"
import type { ReportTransaction } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"

// `onViewDetail` opens the transaction drawer (TransactionsTab); the whole row
// is clickable too, the "Aksi" button is the discoverable entry point.
export function makeReportTransactionColumns(
  onViewDetail: (row: ReportTransaction) => void
): CrudColumn<ReportTransaction>[] {
  return [
    {
      key: "order_no",
      header: "No. Pesanan",
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
      render: (row) => paymentLabelOfRow(row),
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
      // Net amount that stayed with the store; a refunded order also shows the
      // original total struck through and the refunded amount underneath, so
      // real revenue and refunds don't get mixed up.
      key: "net_total",
      header: "Total",
      align: "right",
      render: (row) => {
        const refunded = (row.refund_amount ?? 0) > 0
        return (
          <div className="flex flex-col items-end leading-tight">
            {refunded && (
              <span className="text-xs tabular-nums text-muted-foreground line-through">
                {formatRupiah(row.grand_total ?? 0)}
              </span>
            )}
            <span className="font-semibold tabular-nums text-foreground">
              {formatRupiah(refunded ? row.net_total ?? 0 : row.grand_total ?? 0)}
            </span>
            {refunded && (
              <span className="text-xs tabular-nums text-orange-600 dark:text-orange-400">
                (Ref: -{formatRupiah(row.refund_amount)})
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const meta = orderStatusBadge(row.status, row.refund_status)
        return <Badge className={cn("w-fit", meta.className)}>{meta.label}</Badge>
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (row) => (
        <RowActions>
          <RowActionButton
            icon={EyeIcon}
            label={`Lihat detail ${row.order_no}`}
            onClick={() => onViewDetail(row)}
          />
        </RowActions>
      ),
    },
  ]
}
