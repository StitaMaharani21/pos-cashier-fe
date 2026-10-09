import { PackageXIcon, TrendingUpIcon } from "lucide-react"

import { useTopProducts } from "@/modules/owner/financial-report/financial-report.queries"
import type { TopProductItem, TopProductsSort } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

interface RankedProduct extends TopProductItem {
  rank: number
}

const SORT_OPTIONS: { value: TopProductsSort; label: string }[] = [
  { value: "qty", label: "Berdasarkan Jumlah Terjual" },
  { value: "revenue", label: "Berdasarkan Pendapatan" },
]

function buildColumns(sort: TopProductsSort): CrudColumn<RankedProduct>[] {
  return [
    {
      key: "rank",
      header: "#",
      className: "w-12",
      render: (row) => <span className="font-semibold text-muted-foreground">{row.rank}</span>,
    },
    {
      key: "menu_name",
      header: "Nama Produk",
      render: (row) => <span className="font-medium text-foreground">{row.menu_name}</span>,
    },
    {
      key: "qty",
      header: "Jumlah Terjual",
      align: "right",
      className: sort === "qty" ? "font-semibold text-foreground" : undefined,
      render: (row) => <span className="tabular-nums">{row.qty}</span>,
    },
    {
      key: "revenue",
      header: "Pendapatan",
      align: "right",
      render: (row) => (
        <span
          className={cn(
            "tabular-nums",
            sort === "revenue" ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {formatRupiah(row.revenue)}
        </span>
      ),
    },
  ]
}

function rank(items: TopProductItem[]): RankedProduct[] {
  return items.map((item, index) => ({ ...item, rank: index + 1 }))
}

interface TopProductsTabProps {
  from: string
  to: string
  // Lifted up to FinancialReportSection (unlike other single-query tabs'
  // fully-local state) so the page header's Export button can pass the
  // same sort as `sort=` on GET /reports/sales/export when this tab is
  // active — the export should match what's currently on screen.
  sort: TopProductsSort
  onSortChange: (sort: TopProductsSort) => void
}

// "Produk Terlaris" tab — sort toggle (qty vs revenue) that refetches
// useTopProducts, then two independent ranked lists: best performers and
// "candidates to delist" (worst performers on the same sort). The bottom
// list is deliberately labeled as an evaluation signal rather than just
// "bottom N" so an owner doesn't read it as a ranking to be proud of.
export function TopProductsTab({ from, to, sort, onSortChange }: TopProductsTabProps) {
  const query = useTopProducts({ from, to, sort })

  const columns = buildColumns(sort)
  const topRows = rank(query.data?.top ?? [])
  const bottomRows = rank(query.data?.bottom ?? [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-fit items-center gap-1 rounded-xl border bg-muted/50 p-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSortChange(option.value)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors",
              sort === option.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stacked, not side-by-side: two half-width tables would each need
          their own horizontal scroll to show every column, which is worse
          for an owner than scrolling the page down once. */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Produk Terlaris</h3>
            <p className="text-xs text-muted-foreground">
              Produk dengan performa penjualan terbaik pada periode ini.
            </p>
          </div>
          <CrudTable
            columns={columns}
            rows={topRows}
            getRowId={(row) => row.menu_id}
            isLoading={query.isPending}
            isError={query.isError}
            errorHint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
            onRetry={() => query.refetch()}
            empty={{
              icon: TrendingUpIcon,
              title: "Belum ada produk terjual",
              hint: "Coba pilih rentang tanggal yang lain.",
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Kandidat Dihapus dari Menu</h3>
            <p className="text-xs text-muted-foreground">
              Produk dengan penjualan paling rendah pada periode ini — pertimbangkan untuk dievaluasi.
            </p>
          </div>
          <CrudTable
            columns={columns}
            rows={bottomRows}
            getRowId={(row) => row.menu_id}
            isLoading={query.isPending}
            isError={query.isError}
            errorHint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
            onRetry={() => query.refetch()}
            empty={{
              icon: PackageXIcon,
              title: "Tidak ada data produk berperforma rendah",
              hint: "Coba pilih rentang tanggal yang lain.",
            }}
          />
        </div>
      </div>
    </div>
  )
}
