import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

// "+X.X% vs periode sebelumnya" KpiCard footer, in the green-up/red-down
// idiom of shared/ui/kpi-cards-grid.tsx's DeltaFooter. `percent` is nullable
// per the /reports/sales/summary contract (no previous period to compare
// against) — callers render nothing rather than a misleading "+0.0%".
export function DeltaFooter({ percent, label }: { percent: number | null | undefined; label: string }) {
  if (percent == null) return null
  const positive = percent >= 0

  return (
    <div className="flex items-center gap-1 text-xs">
      <span
        className={cn(
          "flex items-center gap-1 font-semibold",
          positive ? "text-emerald-600" : "text-destructive"
        )}
      >
        {positive ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
        {positive ? "+" : ""}
        {percent.toFixed(1)}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
