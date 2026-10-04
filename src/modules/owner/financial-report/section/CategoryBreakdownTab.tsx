import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useCategoryBreakdown } from "@/modules/owner/financial-report/financial-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

// Cycled by index — same idiom as dashboard/components/PaymentMethodDonutCard
// (the backend returns a dynamic list of categories, so colors can't be
// hardcoded per-category).
const SLICE_COLORS = [
  "#0042A3",
  "#001B3D",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#14B8A6",
]

function formatCompact(value: number): string {
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })}M`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`
  return value.toLocaleString("id-ID")
}

// "Kategori" tab — donut chart of revenue-by-category. Mirrors
// dashboard/components/PaymentMethodDonutCard's Recharts Pie/Cell/
// SLICE_COLORS structure rather than PaymentMethodTab's horizontal-bar
// pattern: a donut is the more natural shape for "share of total revenue"
// than a bar-per-row list. `percentage` comes straight from the backend
// (already computed against total_revenue), so this never re-derives it.
export function CategoryBreakdownTab({ from, to }: { from: string; to: string }) {
  const query = useCategoryBreakdown({ from, to })

  if (query.isPending) {
    return <div className="h-[320px] animate-pulse rounded-xl border bg-muted/40" />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data kategori"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const { items, total_revenue } = query.data

  if (items.length === 0) {
    return (
      <ReportStateCard
        title="Belum ada transaksi pada periode ini"
        hint="Coba pilih rentang tanggal yang lain."
      />
    )
  }

  return (
    <Card className="p-6">
      <h3 className="pb-4 text-sm font-semibold text-foreground">Rincian Pendapatan per Kategori</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="revenue"
                nameKey="category_name"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={2}
                stroke="none"
              >
                {items.map((entry, index) => (
                  <Cell key={entry.category_id} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Total</span>
            <span className="text-base font-bold text-foreground">{formatCompact(total_revenue)}</span>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-3">
          {items.map((item, index) => (
            <div key={item.category_id}>
              <div className="flex items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
                />
                <span className="flex-1 text-sm font-semibold text-foreground">{item.category_name}</span>
                <span className="text-sm font-bold" style={{ color: SLICE_COLORS[index % SLICE_COLORS.length] }}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="mt-0.5 pl-5 text-xs text-muted-foreground">{formatRupiah(item.revenue)}</p>
              {index < items.length - 1 && <div className="mt-3 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
