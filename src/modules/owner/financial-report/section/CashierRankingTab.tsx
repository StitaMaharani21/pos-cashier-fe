import { TrophyIcon } from "lucide-react"
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useCashierRanking } from "@/modules/owner/financial-report/financial-report.queries"
import type { CashierRankingItem } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { SEMANTIC_CHART_COLORS, chartColor } from "@/shared/lib/chart-colors"
import { formatCompactRupiah, formatRupiah } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

const cashierColumns: CrudColumn<CashierRankingItem>[] = [
  {
    key: "cashier_name",
    header: "Kasir",
    render: (row) => <span className="font-medium text-foreground">{row.cashier_name}</span>,
  },
  {
    key: "transaction_count",
    header: "Transaksi Selesai",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.transaction_count}</span>,
  },
  {
    key: "net_revenue",
    header: "Total Penjualan",
    align: "right",
    render: (row) => (
      <span className="font-semibold tabular-nums text-foreground">{formatRupiah(row.net_revenue)}</span>
    ),
  },
  {
    key: "avg_per_transaction",
    header: "Rata-rata per Transaksi",
    align: "right",
    render: (row) => <span className="tabular-nums">{formatRupiah(row.avg_per_transaction)}</span>,
  },
  {
    key: "cancelled_count",
    header: "Transaksi Dibatalkan",
    align: "right",
    render: (row) =>
      row.cancelled_count > 0 ? (
        <span className="tabular-nums font-medium text-destructive">{row.cancelled_count}</span>
      ) : (
        <span className="tabular-nums text-muted-foreground">0</span>
      ),
  },
]

// Long names would overlap on the category axis.
function shortName(name: string): string {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name
}

interface ChartPoint {
  name: string
  fullName: string
  revenue: number
  count: number
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  const point = active ? payload?.[0]?.payload : undefined
  if (!point) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-semibold text-foreground">{point.fullName}</p>
      <p className="text-muted-foreground">
        Total Penjualan: <span className="font-medium text-foreground">{formatRupiah(point.revenue)}</span>
      </p>
      <p className="text-muted-foreground">
        Jumlah Transaksi: <span className="font-medium text-foreground">{point.count}</span>
      </p>
    </div>
  )
}

function CashierChart({ items }: { items: CashierRankingItem[] }) {
  const points: ChartPoint[] = items.map((item) => ({
    name: shortName(item.cashier_name),
    fullName: item.cashier_name,
    revenue: item.net_revenue,
    count: item.transaction_count,
  }))

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <h3 className="text-sm font-semibold text-foreground">Perbandingan Kinerja Kasir</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: SEMANTIC_CHART_COLORS.primary }} />
            Total Penjualan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: chartColor(3) }} />
            Jumlah Transaksi
          </span>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              yAxisId="revenue"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactRupiah}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              width={64}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              width={32}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              name="Total Penjualan"
              fill={SEMANTIC_CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
            />
            <Line
              yAxisId="count"
              dataKey="count"
              name="Jumlah Transaksi"
              type="monotone"
              stroke={chartColor(3)}
              strokeWidth={2}
              dot={{ r: 4, fill: chartColor(3) }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// "Kasir" tab — cashier performance: a chart comparing sales and order volume
// per cashier, then the table behind it. The backend already sorts `items` by
// net revenue desc, so the chart reads as a leaderboard left to right.
export function CashierRankingTab({ from, to }: { from: string; to: string }) {
  const query = useCashierRanking({ from, to })
  const items = query.data?.items ?? []

  if (query.isError) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat kinerja kasir"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {query.isPending ? (
        <div className="h-80 animate-pulse rounded-2xl border bg-muted/40" />
      ) : (
        items.length > 0 && <CashierChart items={items} />
      )}
      <CrudTable
        columns={cashierColumns}
        rows={items}
        getRowId={(row) => row.cashier_id}
        isLoading={query.isPending}
        isError={false}
        minWidth="min-w-[720px]"
        empty={{
          icon: TrophyIcon,
          title: "Belum ada transaksi pada periode ini",
          hint: "Coba pilih rentang tanggal yang lain.",
        }}
      />
    </div>
  )
}
