import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { usePaymentMethodValueBreakdown } from "@/modules/owner/dashboard/dashboard.queries"
import { chartColor } from "@/shared/lib/chart-colors"
import { formatRupiah } from "@/shared/lib/utils"

// Cycled by index — the backend returns a dynamic list of active payment
// methods, so colors can't be hardcoded per-method like the Figma mock did.
// Palette comes from shared/lib/chart-colors so the same method draws in the
// same color here, in Laporan Keuangan and in Sumber Order.

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })}M`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`
  return value.toLocaleString("id-ID")
}

export function PaymentMethodDonutCard() {
  const { data, isPending } = usePaymentMethodValueBreakdown()
  const total = data?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ?? 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">Metode Pembayaran</h2>

      {isPending && (
        <div className="flex h-70 items-center gap-4">
          <div className="size-35 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex w-full flex-1 flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-8 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      )}

      {!isPending && (data?.length ?? 0) === 0 && (
        <div className="flex h-70 items-center justify-center text-center text-sm text-muted-foreground">
          Belum ada transaksi hari ini.
        </div>
      )}

      {!isPending && (data?.length ?? 0) > 0 && (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative size-35 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data?.map((entry, index) => (
                    <Cell
                      key={entry.payment_method_id}
                      fill={chartColor(index)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">Total</span>
              <span className="text-base font-bold text-foreground">
                {formatCompact(total)}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-3">
            {data?.map((item, index) => (
              <div key={item.payment_method_id}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: chartColor(index) }}
                  />
                  <span className="flex-1 text-[13px] font-semibold text-foreground">
                    {item.name}
                  </span>
                  {/* Percentage was colored per-slice, which dropped some
                      labels below 4.5:1 on the card. The swatch already
                      carries the color; the number stays high-contrast. */}
                  <span className="text-[13px] font-bold tabular-nums text-foreground">
                    {(item.percent ?? 0).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatRupiah(item.amount ?? 0)}
                </p>
                {index < (data?.length ?? 0) - 1 && <div className="mt-3 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
