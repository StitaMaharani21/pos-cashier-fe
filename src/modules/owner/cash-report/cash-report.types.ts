// Hand-written response types for pos-kasir-be's GET /reports/cash/* — built
// in parallel with the backend, so not yet generated into owner-schema.d.ts
// (see scripts/generate-owner-types.mjs's ALLOWED_PATH_PREFIXES, which has
// "/reports/cash" added ahead of time for when codegen is run again). Swap
// these for `components["schemas"][...]` re-exports once the backend's
// swagger includes them and codegen has been re-run — same idiom as
// financial-report.types.ts.

export type ShiftCashStatus = "active" | "closed"

export interface ShiftCashRow {
  shift_id: number
  kasir_id: number
  kasir_name: string
  opened_at: string // ISO datetime
  closed_at: string | null
  status: ShiftCashStatus
  is_open: boolean
  saldo_awal: number
  kas_masuk: number
  kas_keluar: number
  penjualan_tunai: number
  // A live estimate (saldo_awal + kas_masuk - kas_keluar + penjualan_tunai)
  // — still meaningful for an open shift, unlike saldo_akhir/selisih below.
  estimasi_saldo_akhir: number
  // null while the shift is still open (is_open === true) — the cashier
  // hasn't counted physical cash yet, so there's nothing to compare
  // estimasi_saldo_akhir against.
  saldo_akhir: number | null
  // null for the same reason as saldo_akhir. Can be negative (cash short)
  // or positive (cash over) once the shift is closed — see
  // lib/selisih.ts for the sign/color convention.
  selisih: number | null
  is_anomaly: boolean
}

// GET /reports/cash/shifts response envelope — the backend wraps the row
// list in its own `{ data: [...] }` object (dto.ShiftsResponse), same
// wrap-in-an-object convention every other /reports/cash/* and
// /reports/sales/* endpoint uses (see CashierCashSummaryResponse etc. below)
// — so unwrapping needs an extra `.data` beyond SingleResponse's own, not
// just SingleResponse<ShiftCashRow[]> directly.
export interface ShiftsResponse {
  data: ShiftCashRow[]
}

export type ShiftCashTransactionType = "in" | "out"

export interface ShiftCashTransaction {
  id: number
  type: ShiftCashTransactionType
  category: string
  amount: number
  description: string
  created_at: string
  created_by_kasir_name: string
}

export interface ShiftCashTransactionsResponse {
  shift_id: number
  data: ShiftCashTransaction[]
}

// GET /reports/cash/summary?from=&to= — "Rekap per Kasir" tab. Backend
// already sorts `items` by ABS(total_variance) desc, so the biggest
// discrepancy (either direction) surfaces first — don't re-sort client-side.
export interface CashierCashSummaryItem {
  kasir_id: number
  kasir_name: string
  shift_count: number
  closed_shift_count: number
  // Sum of selisih across the cashier's closed shifts. Can be negative
  // (net short) or positive (net over) — same sign convention as
  // ShiftCashRow["selisih"], see lib/selisih.ts.
  total_variance: number
}

export interface CashierCashSummaryResponse {
  items: CashierCashSummaryItem[]
  sorted_by: string
}

// GET /reports/cash/trend?days= — "Tren Selisih" tab. Only closed shifts are
// included (an open shift has no selisih yet). Multiple points can share the
// same `date` if a cashier had more than one shift that day — not deduped,
// each is its own point on the chart.
export interface CashVarianceTrendPoint {
  shift_id: number
  date: string // ISO date
  kasir_name: string
  selisih: number
}

export interface CashVarianceTrendResponse {
  days: number
  points: CashVarianceTrendPoint[]
}

// GET /reports/cash/anomalies?from=&to=&threshold= — "Anomali" tab. `items`
// reuses the exact same ShiftCashRow shape as GET /reports/cash/shifts, just
// pre-filtered by the backend to |selisih| >= threshold.
export interface CashAnomaliesResponse {
  threshold: number
  items: ShiftCashRow[]
}
