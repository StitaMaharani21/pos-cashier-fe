import { useState } from "react"

import { useCashVarianceTrend } from "@/modules/owner/cash-report/cash-report.queries"
import { VarianceTrendChart } from "@/modules/owner/cash-report/components/VarianceTrendChart"
import { cn } from "@/shared/lib/utils"

// "Tren Selisih" tab — a 7/30-day toggle over closed-shift cash variance,
// independent of the page's own ?from=&to= range (the /reports/cash/trend
// endpoint only takes `days`, same as dashboard's useSalesTrend). Card
// chrome (title + toggle) borrows SalesTrendCard's visual language; the
// actual chart lives in VarianceTrendChart since that one needs
// negative-aware coloring SalesTrendCard's chart doesn't support.
export function VarianceTrendTab() {
  const [days, setDays] = useState<7 | 30>(30)
  const { data, isPending } = useCashVarianceTrend(days)
  const points = data?.points ?? []

  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-card p-[25px] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tren Selisih Kas {days} Hari Terakhir</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Selisih kas per shift yang sudah ditutup — di atas garis nol berarti kas lebih, di bawah
            berarti kas kurang.
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

      <VarianceTrendChart points={points} isPending={isPending} />
    </div>
  )
}
