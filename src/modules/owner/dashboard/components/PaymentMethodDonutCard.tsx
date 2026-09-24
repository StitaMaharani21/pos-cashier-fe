import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { usePaymentMethodValueBreakdown } from "@/modules/owner/dashboard/dashboard.queries"
import { formatRupiah } from "@/shared/lib/utils"

// Cycled by index — the backend returns a dynamic list of active payment
// methods, so colors can't be hardcoded per-method like the Figma mock did.
const SLICE_COLORS = ["#0042A3", "#001B3D", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })}M`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`
  return value.toLocaleString("id-ID")
}

export function PaymentMethodDonutCard() {
  const { data, isPending } = usePaymentMethodValueBreakdown()
  const total = data?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ?? 0

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-[17px] shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Metode Pembayaran</h2>

      {isPending && (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      )}

      {!isPending && (data?.length ?? 0) === 0 && (
        <div className="flex h-[280px] items-center justify-center text-center text-sm text-muted-foreground">
          Belum ada transaksi hari ini.
        </div>
      )}

      {!isPending && (data?.length ?? 0) > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative h-[140px] w-[140px] shrink-0">
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
                      fill={SLICE_COLORS[index % SLICE_COLORS.length]}
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

          <div className="flex flex-1 flex-col gap-3">
            {data?.map((item, index) => (
              <div key={item.payment_method_id}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
                  />
                  <span className="flex-1 text-[13px] font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: SLICE_COLORS[index % SLICE_COLORS.length] }}
                  >
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
