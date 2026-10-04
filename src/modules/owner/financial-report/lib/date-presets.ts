import { format, startOfDay, startOfMonth, subDays } from "date-fns"

// Local copy of sales-report/lib/date-presets.ts's preset idiom, deliberately
// not imported from there — this module is meant to fully replace
// sales-report in a later cleanup phase, and that module's files will be
// deleted then. The two differ in shape too: /reports/sales/* takes
// inclusive `from`/`to` calendar-day strings (YYYY-MM-DD), unlike
// /orders/financial-report's exclusive-end Date range.
export type DatePreset = "today" | "7d" | "month" | "custom"

export const DATE_PRESET_OPTIONS: { value: Exclude<DatePreset, "custom">; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
]

export interface DateRange {
  from: string
  to: string
}

// Both ends inclusive, store-local calendar days — matches
// GET /reports/sales/*?from=YYYY-MM-DD&to=YYYY-MM-DD.
export function presetToDateRange(preset: Exclude<DatePreset, "custom">, now = new Date()): DateRange {
  const today = startOfDay(now)
  switch (preset) {
    case "today":
      return { from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") }
    case "7d":
      return { from: format(subDays(today, 6), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") }
    case "month":
      return { from: format(startOfMonth(today), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") }
  }
}

// Reverse lookup for highlighting the active preset button from the
// from/to values currently held in ?from=&to= — "custom" when neither
// preset's computed range matches exactly (including a hand-picked range
// that happens to equal today's).
export function detectPreset(from: string, to: string, now = new Date()): DatePreset {
  const match = DATE_PRESET_OPTIONS.find((option) => {
    const range = presetToDateRange(option.value, now)
    return range.from === from && range.to === to
  })
  return match?.value ?? "custom"
}
