import { useState } from "react"
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useSalesTrend } from "@/modules/owner/dashboard/dashboard.queries"
import { cn, formatRupiah } from "@/shared/lib/utils"

// Mirrors index.css's --primary — recharts renders raw SVG attributes, so a
// literal color is more reliable here than `var(--primary)`.
const PRIMARY_COLOR = "oklch(0.38 0.16 260)"
const LIGHT_BAR_COLOR = "oklch(0.38 0.16 260 / 12%)"

function formatCompactRupiah(value: number): string {
  if (value === 0) return "Rp0"
  return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
}

function dayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long" })
}

export function SalesTrendCard() {
  const [days, setDays] = useState<7 | 30>(7)
  const { data, isPending } = useSalesTrend(days)
  const points = data?.points ?? []
  const todayDate = points.at(-1)?.date

  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-card p-[33px] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-foreground">
              Penjualan {days} Hari Terakhir
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Aktif
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pantau fluktuasi pendapatan harian untuk proyeksi stok &amp; staf
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border bg-muted/50 p-1">
          {([7, 30] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors",
                days === option
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option} Hari
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-[25px]">
        <div className="flex flex-wrap items-center gap-8 border-b pb-3.5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Puncak Tertinggi{data?.peak_date === todayDate ? " (Hari Ini)" : ""}
            </p>
            <p className="text-xl font-bold text-foreground">
              {data ? formatRupiah(data.peak_amount ?? 0) : "—"}
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Rata-rata {days} Hari
            </p>
            <p className="text-xl font-bold text-muted-foreground">
              {data ? formatRupiah(data.average_amount ?? 0) : "—"}
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          {isPending ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Memuat...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 28, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={dayLabel}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactRupiah}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value))}
                  labelFormatter={(label) => dayLabel(String(label))}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {points.map((point) => (
                    <Cell
                      key={point.date}
                      fill={point.date === todayDate ? PRIMARY_COLOR : LIGHT_BAR_COLOR}
                    />
                  ))}
                  <LabelList
                    dataKey="revenue"
                    content={(props) => {
                      const { x, y, width, index } = props as {
                        x: number
                        y: number
                        width: number
                        index: number
                      }
                      const point = points[index]
                      if (!point || point.date !== todayDate) return null
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={700}
                          fill={PRIMARY_COLOR}
                        >
                          {formatCompactRupiah(point.revenue ?? 0)}
                        </text>
                      )
                    }}
                  />
                </Bar>
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={PRIMARY_COLOR}
                  strokeWidth={2}
                  dot={{ r: 3, fill: PRIMARY_COLOR, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
