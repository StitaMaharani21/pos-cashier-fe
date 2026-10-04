import { TrophyIcon } from "lucide-react"

import { useCashierRanking } from "@/modules/owner/financial-report/financial-report.queries"
import type { CashierRankingItem } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

interface RankedCashier extends CashierRankingItem {
  rank: number
}

const cashierRankingColumns: CrudColumn<RankedCashier>[] = [
  {
    key: "rank",
    header: "#",
    className: "w-12",
    render: (row) => <span className="font-semibold text-muted-foreground">{row.rank}</span>,
  },
  {
    key: "cashier_name",
    header: "Nama Kasir",
    render: (row) => <span className="font-medium text-foreground">{row.cashier_name}</span>,
  },
  {
    key: "transaction_count",
    header: "Jumlah Transaksi",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.transaction_count} Order</span>,
  },
  {
    key: "net_revenue",
    header: "Pendapatan",
    align: "right",
    render: (row) => (
      <span className="font-semibold tabular-nums text-foreground">{formatRupiah(row.net_revenue)}</span>
    ),
  },
]

// "Kasir" tab — ranked list of cashiers by net revenue. The backend already
// sorts `items` by net_revenue desc (see CashierRanking.sorted_by), so this
// just numbers the rows for a leaderboard read rather than re-sorting.
export function CashierRankingTab({ from, to }: { from: string; to: string }) {
  const query = useCashierRanking({ from, to })

  const rows: RankedCashier[] = (query.data?.items ?? []).map((item, index) => ({
    ...item,
    rank: index + 1,
  }))

  return (
    <CrudTable
      columns={cashierRankingColumns}
      rows={rows}
      getRowId={(row) => row.cashier_id}
      isLoading={query.isPending}
      isError={query.isError}
      errorHint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
      onRetry={() => query.refetch()}
      empty={{
        icon: TrophyIcon,
        title: "Belum ada transaksi pada periode ini",
        hint: "Coba pilih rentang tanggal yang lain.",
      }}
    />
  )
}
