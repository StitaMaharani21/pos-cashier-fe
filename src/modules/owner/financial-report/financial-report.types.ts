// Hand-written response types for pos-kasir-be's GET /reports/sales/* —
// built in parallel with the backend, so not yet generated into
// owner-schema.d.ts (see scripts/generate-owner-types.mjs's
// ALLOWED_PATH_PREFIXES, which has "/reports/sales" added ahead of time for
// when codegen is run again). Swap these for
// `components["schemas"][...]` re-exports once the backend's swagger
// includes them and codegen has been re-run — same idiom as
// entities/order/model/order-analytics.types.ts.

export interface SalesSummaryComparison {
  previous_from: string
  previous_to: string
  previous_total_transactions: number
  previous_net_revenue: number
  // null when there's no previous period to compare against (e.g. the
  // previous window had 0 transactions) — callers must omit the delta
  // badge in that case, not render "+0.0%".
  total_transactions_change_pct: number | null
  net_revenue_change_pct: number | null
}

export interface SalesSummary {
  total_transactions: number
  gross_revenue: number
  net_revenue: number
  avg_per_transaction: number
  avg_items_per_transaction: number
  comparison: SalesSummaryComparison
}

export interface PaymentMethodBreakdownItem {
  payment_method_id: number
  name: string
  total_amount: number
  transaction_count: number
  percentage: number
}

export interface PaymentMethodBreakdown {
  items: PaymentMethodBreakdownItem[]
  total_amount: number
}

export interface DiscountImpact {
  total_discount_value: number
  gross_revenue: number
  net_revenue: number
  total_order_count: number
  voucher_order_count: number
  voucher_order_percentage: number
  auto_discount_order_count: number
  auto_discount_order_percentage: number
}

export interface ReportTransaction {
  order_no: string
  created_at: string
  cashier_name: string
  item_count: number
  payment_method_name: string
  discount_amount: number
  grand_total: number
  status: string
}

export interface ReportTransactionListResponse {
  data: ReportTransaction[]
  page: number
  per_page: number
  total: number
}

export interface CashierRankingItem {
  cashier_id: number
  cashier_name: string
  transaction_count: number
  net_revenue: number
}

export interface CashierRanking {
  items: CashierRankingItem[]
  // Already sorted by net_revenue desc by the backend — callers don't
  // re-sort, this just documents which field the order reflects.
  sorted_by: string
}

export interface CancelledByCashier {
  // null for cancellations the backend can't attribute to a specific
  // cashier (e.g. system-cancelled orders) — cashier_name is expected to
  // already carry a human label ("Sistem" or similar) for those rows, so
  // callers render cashier_name verbatim rather than special-casing null.
  cashier_id: number | null
  cashier_name: string
  count: number
  value: number
}

export interface CancelledSummary {
  total_count: number
  total_value: number
  by_cashier: CancelledByCashier[]
}

export interface CategoryBreakdownItem {
  category_id: number
  category_name: string
  revenue: number
  percentage: number
}

export interface CategoryBreakdown {
  items: CategoryBreakdownItem[]
  total_revenue: number
}

export interface PeakHourCell {
  // 1=Senin..7=Minggu, matching the backend's ISO-ish weekday numbering
  // (not JS's Date#getDay() where 0=Sunday) — see PeakHoursTab's DAYS map.
  day_of_week: number
  day_label: string
  hour: number // 0-23
  transaction_count: number
  revenue: number
}

export interface PeakHoursHeatmap {
  // Always 168 entries (7 days x 24 hours), one per day/hour combination —
  // callers index into it via a Map keyed by `${day_of_week}-${hour}`
  // rather than assuming array order.
  cells: PeakHourCell[]
  max_transaction_count: number
  max_revenue: number
}

export type TopProductsSort = "qty" | "revenue"

export interface TopProductItem {
  menu_id: number
  menu_name: string
  qty: number
  revenue: number
}

export interface TopProductsReport {
  sort: TopProductsSort
  limit: number
  // Best performers under the requested sort.
  top: TopProductItem[]
  // Worst performers under the requested sort — surfaced as a "consider
  // delisting" signal, not just "bottom of the list" (see TopProductsTab).
  bottom: TopProductItem[]
}

export interface TaxSummary {
  // A store-wide rate (0-100), not per-item — 0 almost always means the
  // store hasn't configured a tax rate yet rather than "no tax collected
  // this period", so callers show an informational empty state for that
  // case instead of a confusing Rp0 card (see TaxTab).
  tax_percentage: number
  total_tax_collected: number
  total_transactions: number
}

// Pro/Enterprise-gated (RequirePlan on the backend) — GET
// /reports/sales/order-source 403s for a Starter-plan store. See
// OrderSourceTab, which mirrors this gate client side via
// useCapabilities().caps?.plan before even firing the request.
export interface OrderSourceBreakdown {
  qr_order_count: number
  qr_order_percentage: number
  manual_order_count: number
  manual_order_percentage: number
  total_order_count: number
}
