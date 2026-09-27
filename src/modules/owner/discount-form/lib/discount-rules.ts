import { addDays, format, formatISO, parseISO } from "date-fns"
import { id as localeId } from "date-fns/locale"

import { formatRupiah } from "@/shared/lib/utils"

export type DiscountType = "percent" | "fixed"

export const NAME_MAX = 50

// Day codes as the backend stores them (internal/master/discount/entities),
// in the design's Sen..Min order.
export const DAY_OPTIONS = [
  { code: "mon", label: "Sen" },
  { code: "tue", label: "Sel" },
  { code: "wed", label: "Rab" },
  { code: "thu", label: "Kam" },
  { code: "fri", label: "Jum" },
  { code: "sat", label: "Sab" },
  { code: "sun", label: "Min" },
] as const
export const ALL_DAYS: string[] = DAY_OPTIONS.map((day) => day.code)

export interface DiscountRule {
  type: DiscountType
  value: number
  // 0 = no cap. Only meaningful for percent.
  maxDiscount: number
}

// Mirrors pricing.DiscountAmountFor in pos-kasir-be: percent of the base,
// capped by maxDiscount, never more than the base itself. Preview only —
// the backend recomputes every price.
export function discountAmount(rule: DiscountRule, base: number): number {
  if (!(base > 0) || !(rule.value > 0)) return 0
  let amount = rule.type === "percent" ? (base * rule.value) / 100 : rule.value
  if (rule.type === "percent" && rule.maxDiscount > 0) amount = Math.min(amount, rule.maxDiscount)
  return Math.round(Math.min(amount, base))
}

export function describeValue(rule: DiscountRule): string {
  if (rule.type === "fixed") return formatRupiah(rule.value)
  const cap = rule.maxDiscount > 0 ? ` (maks. ${formatRupiah(rule.maxDiscount)})` : ""
  return `${rule.value}%${cap}`
}

// ---------- Dates ----------

// "YYYY-MM-DD" ⇄ API. Sent as local midnight with the browser's offset
// ("2026-10-01T00:00:00+07:00") so the backend's end-of-day normalisation
// (00:00:00 → 23:59:59) applies in the store's own day, not UTC's.
export function toApiDate(date: string): string {
  return formatISO(parseISO(date))
}

export function fromApiDate(value?: string | null): string {
  return value ? value.slice(0, 10) : ""
}

export function todayInput(offsetDays = 0): string {
  return format(addDays(new Date(), offsetDays), "yyyy-MM-dd")
}

export function formatDateLabel(date: string): string {
  return format(parseISO(date), "d MMM yyyy", { locale: localeId })
}

export function describePeriod(startDate: string, endDate: string): string {
  if (!startDate) return "—"
  if (!endDate) return `Mulai ${formatDateLabel(startDate)} · tanpa batas`
  if (startDate === endDate) return formatDateLabel(startDate)
  return `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`
}

// Mid-sentence variant for the summaries ("Berlaku mulai 1 Okt 2026 · ...").
export function describePeriodInline(startDate: string, endDate: string): string {
  const label = describePeriod(startDate, endDate)
  return label.charAt(0).toLowerCase() + label.slice(1)
}

// Same label for the list's "Periode" column (API values).
export function describeApiPeriod(start?: string | null, end?: string | null): string {
  return describePeriod(fromApiDate(start), fromApiDate(end))
}

export type PeriodPreset = "today" | "7d" | "30d" | "open"

export const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Hari ini" },
  { value: "7d", label: "7 hari" },
  { value: "30d", label: "30 hari" },
  { value: "open", label: "Tanpa batas" },
]

export function presetRange(preset: PeriodPreset, currentStart: string): { startDate: string; endDate: string } {
  const today = todayInput()
  switch (preset) {
    case "today":
      return { startDate: today, endDate: today }
    case "7d":
      return { startDate: today, endDate: todayInput(6) }
    case "30d":
      return { startDate: today, endDate: todayInput(29) }
    case "open":
      return { startDate: currentStart || today, endDate: "" }
  }
}

export function activePreset(startDate: string, endDate: string): PeriodPreset | null {
  if (!endDate) return "open"
  if (startDate !== todayInput()) return null
  if (endDate === todayInput()) return "today"
  if (endDate === todayInput(6)) return "7d"
  if (endDate === todayInput(29)) return "30d"
  return null
}

// ---------- Hari & jam (diskon otomatis) ----------

export function describeDays(days: string[]): string {
  if (days.length === 0 || days.length === ALL_DAYS.length) return "Setiap hari"
  const weekdays = ["mon", "tue", "wed", "thu", "fri"]
  if (days.length === 5 && weekdays.every((day) => days.includes(day))) return "Sen–Jum"
  if (days.length === 2 && days.includes("sat") && days.includes("sun")) return "Sab–Min"
  return DAY_OPTIONS.filter((day) => days.includes(day.code))
    .map((day) => day.label)
    .join(", ")
}

export function describeHours(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "Sepanjang hari"
  return `${startTime}–${endTime}${endTime < startTime ? " (lewat tengah malam)" : ""}`
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// 8 chars without look-alikes (0/O, 1/I).
export function randomVoucherCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")
}
