import { formatRupiah } from "@/shared/lib/utils"

// Sign/color convention for a shift's cash variance (`selisih`), shared by
// shift-cash.columns.tsx and ShiftCashTransactionsSheet's summary block:
//
// - Negative (cash counted is SHORT of the estimate) — a real shortfall,
//   destructive/red.
// - Positive (cash counted EXCEEDS the estimate) — still a bookkeeping gap
//   to investigate, not "good news", so amber/warning — explicitly never
//   green.
// - Zero — plain muted text, nothing to flag.
//
// formatRupiah (shared/lib/utils.ts) already sign-prefixes negative values
// via Intl's currency formatter ("-Rp 15.000") but never prefixes positive
// ones, so a "+" is prepended by hand here to make the sign explicit both
// ways.
export function formatSelisih(value: number): string {
  if (value > 0) return `+${formatRupiah(value)}`
  return formatRupiah(value)
}

export function selisihToneClassName(value: number): string {
  if (value < 0) return "text-destructive"
  if (value > 0) return "text-amber-600"
  return "text-muted-foreground"
}

// Keterangan selisih kas (aktual - diharapkan) sesuai spesifikasi rekonsiliasi
// kas laci. Warna: sesuai = hijau, surplus = kuning/amber, shortage = merah.
export type SelisihStatus = "balanced" | "surplus" | "shortage"

export function selisihStatus(value: number): SelisihStatus {
  if (value > 0) return "surplus"
  if (value < 0) return "shortage"
  return "balanced"
}

export const SELISIH_STATUS_LABEL: Record<SelisihStatus, string> = {
  balanced: "Uang Pas",
  surplus: "Uang Lebih",
  shortage: "Uang Kurang",
}

export const SELISIH_STATUS_BADGE_CLASSNAME: Record<SelisihStatus, string> = {
  balanced: "bg-emerald-500/10 text-emerald-700",
  surplus: "bg-amber-500/15 text-amber-700",
  shortage: "bg-destructive/10 text-destructive",
}
