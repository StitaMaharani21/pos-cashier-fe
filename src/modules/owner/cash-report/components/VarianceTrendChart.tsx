import { format } from "date-fns"
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { CashVarianceTrendPoint } from "@/modules/owner/cash-report/cash-report.types"
import { formatSelisih } from "@/modules/owner/cash-report/lib/selisih"
import { SEMANTIC_CHART_COLORS } from "@/shared/lib/chart-colors"

// Colors come from the shared chart tokens (index.css) so they track
// light/dark like everything else — recharts writes these straight into SVG
// fill attributes, where `var(--x)` resolves fine. Deliberately NOT green for
// positive: a positive variance is still a bookkeeping gap to investigate,
// not "good news" (see lib/selisih.ts), so it reuses the same amber as
// "manual / off-system" elsewhere in the app.
const NEGATIVE_COLOR = "var(--destructive)"
const POSITIVE_COLOR = SEMANTIC_CHART_COLORS.manual
const NEUTRAL_COLOR = "var(--muted-foreground)"

function colorFor(selisih: number): string {
  if (selisih < 0) return NEGATIVE_COLOR
  if (selisih > 0) return POSITIVE_COLOR
  return NEUTRAL_COLOR
}

function formatCompactRupiah(value: number): string {
  if (value === 0) return "Rp0"
  const sign = value < 0 ? "-" : ""
  return `${sign}${(Math.abs(value) / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`
}

function formatDateLabel(value: string): string {
  return format(new Date(value), "d MMM")
}

interface TooltipPayloadEntry {
  payload: CashVarianceTrendPoint
}

function VarianceTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload

  return (
    <div className="rounded-lg border bg-popover p-2.5 text-xs shadow-sm">
      <p className="font-semibold text-foreground">{point.kasir_name || "—"}</p>
      <p className="text-muted-foreground">{formatDateLabel(point.date)}</p>
      <p className="mt-1 font-semibold" style={{ color: colorFor(point.selisih) }}>
        {formatSelisih(point.selisih)}
      </p>
    </div>
  )
}

interface VarianceTrendChartProps {
  points: CashVarianceTrendPoint[]
  isPending: boolean
}

// The trend chart itself — bars above/below a zero baseline, colored by
// sign. Intentionally a NEW component rather than reusing SalesTrendCard's
// chart: that one assumes non-negative revenue throughout (bar starts at 0
// going up, YAxis never needs a negative domain), which doesn't hold here.
//
// Multiple points can share the same `date` (a cashier can close 2+ shifts
// in a day) — not deduped, XAxis just plots each shift_id as its own bar.
export function VarianceTrendChart({ points, isPending }: VarianceTrendChartProps) {
  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat...</div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Belum ada shift selesai</p>
        <p>Tidak ada shift yang sudah ditutup pada rentang hari ini.</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactRupiah}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            width={64}
          />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Tooltip content={<VarianceTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="selisih" radius={[4, 4, 4, 4]} maxBarSize={28}>
            {points.map((point) => (
              <Cell key={point.shift_id} fill={colorFor(point.selisih)} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
