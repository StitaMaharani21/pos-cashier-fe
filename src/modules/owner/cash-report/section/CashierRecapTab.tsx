import { UsersIcon } from "lucide-react"

import { useCashierCashSummary } from "@/modules/owner/cash-report/cash-report.queries"
import type { CashierCashSummaryItem } from "@/modules/owner/cash-report/cash-report.types"
import { formatSelisih, selisihToneClassName } from "@/modules/owner/cash-report/lib/selisih"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

const cashierCashSummaryColumns: CrudColumn<CashierCashSummaryItem>[] = [
  {
    key: "kasir_name",
    header: "Kasir",
    render: (row) => <span className="font-medium text-foreground">{row.kasir_name || "—"}</span>,
  },
  {
    key: "shift_count",
    header: "Jumlah Shift",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.shift_count}</span>,
  },
  {
    key: "closed_shift_count",
    header: "Shift Selesai",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.closed_shift_count}</span>,
  },
  {
    key: "total_variance",
    header: "Total Selisih",
    align: "right",
    render: (row) => (
      <span className={cn("tabular-nums font-semibold", selisihToneClassName(row.total_variance))}>
        {formatSelisih(row.total_variance)}
      </span>
    ),
  },
]

// "Rekap per Kasir" tab — one row per cashier, ranked by |total_variance|
// desc (backend-sorted, see CashierCashSummaryResponse["sorted_by"] — don't
// re-sort client-side, same idiom as CashierRankingTab in financial-report).
export function CashierRecapTab({ from, to }: { from: string; to: string }) {
  const query = useCashierCashSummary({ from, to })
  const rows = query.data?.items ?? []

  return (
    <CrudTable
      columns={cashierCashSummaryColumns}
      rows={rows}
      getRowId={(row) => row.kasir_id}
      isLoading={query.isPending}
      isError={query.isError}
      errorHint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
      onRetry={() => query.refetch()}
      empty={{
        icon: UsersIcon,
        title: "Belum ada shift pada periode ini",
        hint: "Tidak ada rekap kas per kasir untuk rentang tanggal ini.",
      }}
    />
  )
}
