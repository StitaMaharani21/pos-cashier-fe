import { addDays, startOfDay, startOfMonth, subDays } from "date-fns"

export type DatePreset = "today" | "7d" | "month" | "custom"

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
]

// `end` is always exclusive (start of the day after the last included day),
// matching /orders/financial-report's RFC3339 start-inclusive/end-exclusive
// contract.
export function presetToRange(preset: Exclude<DatePreset, "custom">, now = new Date()) {
  const today = startOfDay(now)
  const end = addDays(today, 1)

  switch (preset) {
    case "today":
      return { start: today, end }
    case "7d":
      return { start: subDays(today, 6), end }
    case "month":
      return { start: startOfMonth(today), end }
  }
}
