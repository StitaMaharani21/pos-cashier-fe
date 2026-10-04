import {
  DATE_PRESET_OPTIONS,
  detectPreset,
  presetToDateRange,
} from "@/modules/owner/financial-report/lib/date-presets"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

interface ReportFilterBarProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

// The one date-range filter for the whole "Laporan Keuangan" page — unlike
// sales-report's SalesReportFilterBar (which only ever filtered its own
// transaction table), `from`/`to` here live in the page's own ?from=&to=
// URL params (see FinancialReportSection) and are passed down to every
// tab's query, so switching tabs keeps the same range and every KPI/table
// on the page reflects it. Kasir/No. Order filters are tab-local
// (TransactionsTab) instead, since only that tab's endpoint accepts them.
export function ReportFilterBar({ from, to, onChange }: ReportFilterBarProps) {
  const preset = detectPreset(from, to)

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex gap-2">
        {DATE_PRESET_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={preset === option.value ? "default" : "outline"}
            onClick={() => {
              const range = presetToDateRange(option.value)
              onChange(range.from, range.to)
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onChange(event.target.value, to)}
          className={cn(
            "h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            preset === "custom" && "border-primary"
          )}
        />
        <span className="text-sm text-muted-foreground">–</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onChange(from, event.target.value)}
          className={cn(
            "h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            preset === "custom" && "border-primary"
          )}
        />
      </div>
    </div>
  )
}
