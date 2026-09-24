import type { components } from "@/shared/api/generated/owner-schema"

// Owner dashboard analytics — read-only, all scoped to "today vs yesterday"
// or a rolling N-day window (store timezone). See pos-kasir-be's
// internal/transaction/order/dto/order_dto.go for the source structs.
export type DashboardSummary = components["schemas"]["dto.DashboardSummaryResponse"]
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
