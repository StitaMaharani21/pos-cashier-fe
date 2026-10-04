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

// Literal colors mirroring index.css's --destructive/--muted-foreground and
// the amber-600 Tailwind literal already used for "positive selisih" across
// this module (lib/selisih.ts, shift-cash.columns.tsx) — recharts renders
// raw SVG attributes for per-point Cell fills, so a literal value is more
// reliable than var(--x) here, same reasoning as SalesTrendCard's
// PRIMARY_COLOR. Deliberately NOT green for positive — a positive variance
// is still a bookkeeping gap to investigate, not "good news" (see
// lib/selisih.ts).
const NEGATIVE_COLOR = "oklch(0.577 0.245 27.325)" // mirrors --destructive
const POSITIVE_COLOR = "#F59E0B" // amber-600, same literal as PaymentMethodDonutCard/CategoryBreakdownTab
const NEUTRAL_COLOR = "oklch(0.446 0.02 260)" // mirrors --muted-foreground

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
