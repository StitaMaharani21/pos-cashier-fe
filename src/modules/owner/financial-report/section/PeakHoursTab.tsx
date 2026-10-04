import { Fragment } from "react"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { usePeakHours } from "@/modules/owner/financial-report/financial-report.queries"
import type { PeakHourCell } from "@/modules/owner/financial-report/financial-report.types"
import { formatRupiah } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

// Mirrors index.css's --primary — recharts/plain divs both need a literal
// color value for inline styles, so this can't rely on `var(--primary)`
// (same idiom as dashboard/components/SalesTrendCard's PRIMARY_COLOR).
const PRIMARY_HUE = "oklch(0.38 0.16 260"

// day_of_week from the backend is 1=Senin..7=Minggu (not JS's
// Date#getDay(), where 0=Sunday) — this fixes the row order regardless of
// what order `cells` arrives in.
const DAYS: { value: number; label: string; short: string }[] = [
  { value: 1, label: "Senin", short: "Sen" },
  { value: 2, label: "Selasa", short: "Sel" },
  { value: 3, label: "Rabu", short: "Rab" },
  { value: 4, label: "Kamis", short: "Kam" },
  { value: 5, label: "Jumat", short: "Jum" },
  { value: 6, label: "Sabtu", short: "Sab" },
  { value: 7, label: "Minggu", short: "Min" },
]

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

// Alpha-blended intensity scale: 0 transactions still renders a faint
// (6%) swatch so the grid stays legible, scaling linearly up to 100%
// opacity at max_transaction_count. Cells with a count are floored at a
// slightly higher alpha (10%) so single-digit-count cells aren't
// indistinguishable from zero.
function intensityColor(count: number, max: number): string {
  if (count <= 0) return `${PRIMARY_HUE} / 6%)`
  const ratio = max > 0 ? count / max : 0
  const alpha = Math.round(Math.min(100, Math.max(10, ratio * 100)))
  return `${PRIMARY_HUE} / ${alpha}%)`
}

// "Jam Sibuk" tab — 24x7 heatmap of transaction volume by day-of-week and
// hour-of-day. Recharts has no heatmap primitive, so this is a plain
// CSS-grid of colored cells rather than a chart component; a `title`
// attribute stands in for a proper tooltip per the phase's scope (nothing
// fancier needed for a first cut).
export function PeakHoursTab({ from, to }: { from: string; to: string }) {
  const query = usePeakHours({ from, to })

  if (query.isPending) {
    return <div className="h-[420px] animate-pulse rounded-xl border bg-muted/40" />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data jam sibuk"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const { cells, max_transaction_count } = query.data

  if (max_transaction_count <= 0) {
    return (
      <ReportStateCard
        title="Belum ada transaksi pada periode ini"
        hint="Coba pilih rentang tanggal yang lain."
      />
    )
  }

  const cellMap = new Map<string, PeakHourCell>()
  for (const cell of cells) {
    cellMap.set(`${cell.day_of_week}-${cell.hour}`, cell)
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <h3 className="text-sm font-semibold text-foreground">Kepadatan Transaksi per Jam</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Sepi</span>
          <div className="flex gap-0.5">
            {[6, 25, 50, 75, 100].map((alpha) => (
              <span
                key={alpha}
                className="size-3 rounded-[2px]"
                style={{ backgroundColor: `${PRIMARY_HUE} / ${alpha}%)` }}
              />
            ))}
          </div>
          <span>Ramai</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[820px] grid-cols-[56px_repeat(24,minmax(0,1fr))] gap-[3px]">
          <div />
          {HOURS.map((hour) => (
            <div key={hour} className="text-center text-[10px] font-medium text-muted-foreground">
              {String(hour).padStart(2, "0")}
            </div>
          ))}

          {DAYS.map((day) => (
            <Fragment key={day.value}>
              <div className="flex items-center text-xs font-semibold text-muted-foreground">
                {day.short}
              </div>
              {HOURS.map((hour) => {
                const cell = cellMap.get(`${day.value}-${hour}`)
                const count = cell?.transaction_count ?? 0
                const revenue = cell?.revenue ?? 0
                return (
                  <div
                    key={hour}
                    title={`${day.label}, ${String(hour).padStart(2, "0")}:00 — ${count} transaksi, ${formatRupiah(revenue)}`}
                    className="aspect-square rounded-[3px]"
                    style={{ backgroundColor: intensityColor(count, max_transaction_count) }}
                  />
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </Card>
  )
}
