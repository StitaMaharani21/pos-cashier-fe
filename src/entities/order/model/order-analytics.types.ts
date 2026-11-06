import type { components } from "@/shared/api/generated/owner-schema"

// Owner dashboard analytics — read-only, all scoped to "today vs yesterday"
// or a rolling N-day window (store timezone). See pos-kasir-be's
// internal/transaction/order/dto/order_dto.go for the source structs.
export type DashboardSummary = components["schemas"]["dto.DashboardSummaryResponse"] &
  ShiftDashboardFields

// Only filled by GET /orders/dashboard-summary?since_shift_open=true (and only
// while a shift is open). Hand-written because the generated schema predates
// them. `total_cash` / `total_non_cash` stay NET of refunds for older clients;
// `cash_sales` / `non_cash_sales` are the gross figures, so
// total_revenue = cash_sales + non_cash_sales - total_refunds. Opening cash is
// never part of revenue; it only feeds `expected_cash`.
export interface ShiftDashboardFields {
  total_refunds?: number
  shift_opened_at?: string
  opening_balance?: number
  cash_refunds?: number
  cash_in_drawer?: number
  cash_sales?: number
  non_cash_sales?: number
  cash_in?: number
  cash_out?: number
  // opening_balance + cash_sales + cash_in - cash_out - cash_refunds
  expected_cash?: number
  // One row per open shift (cashier). Every figure above is the SUM over these.
  shifts?: DashboardShiftSummary[]
}

export interface DashboardShiftSummary {
  shift_id: number
  user_id: number
  cashier_name: string
  opened_at: string
  total_revenue: number
  total_orders: number
  cash_sales: number
  non_cash_sales: number
  cash_in: number
  cash_out: number
  total_refunds: number
  opening_balance: number
  expected_cash: number
}
// The daily allowance is a SOFT limit: the cashier is never blocked. On Starter, every
// transaction past the daily limit costs `overage_price` (billed at month end). The
// fields below were added after the generated schema. Money fields are owner-only
// (absent for the cashier).
export type DailyTransactionLimit = components["schemas"]["dto.DailyTransactionLimitResponse"] & {
  remaining?: number
  over_today?: number
  // Transactions past the daily limit, summed over this month's days.
  month_over?: number
  level?: "ok" | "near" | "over"
  overage_price?: number
  over_today_amount?: number
  month_overage_amount?: number
}
export type PaymentMethodValueBreakdown =
  components["schemas"]["dto.PaymentMethodValueBreakdownResponse"]
export type SalesTrendPoint = components["schemas"]["dto.SalesTrendPointResponse"]
export type SalesTrend = components["schemas"]["dto.SalesTrendResponse"]
export type OrderTypeCompositionItem =
  components["schemas"]["dto.OrderTypeCompositionItem"]
export type OrderComposition = components["schemas"]["dto.OrderCompositionResponse"]
export type PopularMenu = components["schemas"]["dto.PopularMenuResponse"]

// Backs `modules/owner/sales-report`, not dashboard — kept here since it's
// re-exported from the same generated schema as the widgets above.
export type FinancialReportTransaction =
  components["schemas"]["dto.FinancialReportTransactionResponse"]
export type FinancialReportPageSummary =
  components["schemas"]["dto.FinancialReportPageSummary"]
export type FinancialReportListResponse =
  components["schemas"]["dto.FinancialReportListResponse"]
