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
}
export type DailyTransactionLimit =
  components["schemas"]["dto.DailyTransactionLimitResponse"]
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
