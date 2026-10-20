import { useState } from "react"
import { format, parseISO } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CalendarDaysIcon } from "lucide-react"

import { useDailySales } from "@/modules/owner/financial-report/financial-report.queries"
import type { DailySalesItem } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { formatRupiah } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { TablePagination } from "@/shared/ui/table-pagination"

const money = (value: number) => <span className="tabular-nums">{formatRupiah(value)}</span>

const columns: CrudColumn<DailySalesItem>[] = [
  {
    key: "date",
    header: "Tanggal",
    render: (row) => (
      <span className="font-medium text-foreground">{format(parseISO(row.date), "d MMM yyyy", { locale: localeId })}</span>
    ),
  },
  {
    key: "total_orders",
    header: "Total Order",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.total_orders}</span>,
  },
  { key: "gross_revenue", header: "Pendapatan Kotor", align: "right", render: (row) => money(row.gross_revenue) },
  {
    key: "discount",
    header: "Diskon",
    align: "right",
    render: (row) =>
      row.discount > 0 ? (
        <span className="tabular-nums text-destructive">-{formatRupiah(row.discount)}</span>
      ) : (
        "—"
      ),
  },
  { key: "tax", header: "Pajak", align: "right", render: (row) => money(row.tax) },
  {
    key: "net_revenue",
    header: "Pendapatan Bersih",
    align: "right",
    render: (row) => <span className="font-semibold tabular-nums text-foreground">{formatRupiah(row.net_revenue)}</span>,
  },
]

// Breakdown of the cards above, one row per date of the selected period that
// had completed orders (newest first), with a totals line that matches the
// cards. The backend returns every day at once, so paging is client-side.
export function DailyBreakdownTable({ from, to }: { from: string; to: string }) {
  const query = useDailySales({ from, to })
  const [page, setPage] = useState(1)

  const days = query.data?.days ?? []
  const totals = query.data?.totals
  const totalPages = Math.max(1, Math.ceil(days.length / TABLE_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const rows = days.slice((currentPage - 1) * TABLE_PER_PAGE, currentPage * TABLE_PER_PAGE)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Rincian Harian</h3>
      <CrudTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.date}
        isLoading={query.isPending}
        isError={query.isError}
        errorHint="Rincian harian tidak dapat dimuat. Coba lagi beberapa saat lagi."
        onRetry={() => query.refetch()}
        minWidth="min-w-[720px]"
        empty={{
          icon: CalendarDaysIcon,
          title: "Belum ada transaksi selesai",
          hint: "Tidak ada transaksi selesai pada rentang tanggal ini.",
        }}
        footer={
          totals &&
          days.length > 0 && (
            <div className="flex flex-col">
              <div
                data-testid="daily-totals"
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-muted/40 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-foreground">Total</span>
                <span className="tabular-nums text-muted-foreground">{totals.total_orders} order</span>
                <span className="tabular-nums">{formatRupiah(totals.gross_revenue)}</span>
                <span className="tabular-nums text-destructive">
                  {totals.discount > 0 ? `-${formatRupiah(totals.discount)}` : "—"}
                </span>
                <span className="tabular-nums">{formatRupiah(totals.tax)}</span>
                <span className="font-semibold tabular-nums text-foreground">{formatRupiah(totals.net_revenue)}</span>
              </div>
              {days.length > TABLE_PER_PAGE && (
                <TablePagination
                  page={currentPage}
                  totalPages={totalPages}
                  total={days.length}
                  perPage={TABLE_PER_PAGE}
                  noun="hari"
                  onPageChange={setPage}
                />
              )}
            </div>
          )
        }
      />
    </div>
  )
}
