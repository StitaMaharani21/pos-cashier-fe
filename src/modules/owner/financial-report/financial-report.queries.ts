import { useMutation, useQuery } from "@tanstack/react-query"

import type {
  CancelledSummary,
  CashierRanking,
  CategoryBreakdown,
  DiscountImpact,
  OrderSourceBreakdown,
  PaymentMethodBreakdown,
  PeakHoursHeatmap,
  ReportTransactionListResponse,
  SalesSummary,
  TaxSummary,
  TopProductsReport,
  TopProductsSort,
} from "@/modules/owner/financial-report/financial-report.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"

// One useQuery wrapper per GET /reports/sales/* endpoint — same "read-only
// exception" idiom as dashboard.queries.ts and sales-report.queries.ts (no
// generic CrudService, this module has no create/update/delete). All four
// endpoints take the same `from`/`to` (YYYY-MM-DD, inclusive) pair; the
// transactions list additionally takes kasir_id/order_no/page/per_page.

interface DateRangeParams {
  from: string
  to: string
}

export function useSalesSummary({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "summary", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<SalesSummary>>("/reports/sales/summary", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

export function useByPaymentMethod({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "by-payment-method", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<PaymentMethodBreakdown>>(
        "/reports/sales/by-payment-method",
        { params: { from, to } }
      )
      return res.data.data
    },
  })
}

export function useDiscountImpact({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "discounts", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<DiscountImpact>>("/reports/sales/discounts", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

export function useCashierRanking({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "by-cashier", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CashierRanking>>("/reports/sales/by-cashier", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

// Shared by the "Void/Batal" tab count badge (FinancialReportSection),
// VoidTransactionsTab's own body, and SummaryTab's anti-fraud banner — all
// three call this exact hook with the same `from`/`to`, so they share one
// queryKey (["financial-report", "cancelled", from, to]) and React Query
// dedupes/caches the request instead of each caller firing its own fetch.
export function useCancelledSummary({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "cancelled", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CancelledSummary>>("/reports/sales/cancelled", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

export function useCategoryBreakdown({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "by-category", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CategoryBreakdown>>("/reports/sales/by-category", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

export function usePeakHours({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "peak-hours", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<PeakHoursHeatmap>>("/reports/sales/peak-hours", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

interface TopProductsParams extends DateRangeParams {
  sort: TopProductsSort
  limit?: number
}

export function useTopProducts({ from, to, sort, limit = 10 }: TopProductsParams) {
  return useQuery({
    queryKey: ["financial-report", "top-products", from, to, sort, limit],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<TopProductsReport>>("/reports/sales/top-products", {
        params: { from, to, sort, limit },
      })
      return res.data.data
    },
  })
}

interface ReportTransactionsParams extends DateRangeParams {
  kasirId?: number
  orderNo?: string
  page: number
  perPage: number
}

export function useReportTransactions(params: ReportTransactionsParams) {
  return useQuery({
    queryKey: ["financial-report", "transactions", params],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<ReportTransactionListResponse>>(
        "/reports/sales/transactions",
        {
          params: {
            from: params.from,
            to: params.to,
            kasir_id: params.kasirId,
            order_no: params.orderNo || undefined,
            page: params.page,
            per_page: params.perPage,
          },
        }
      )
      return res.data.data
    },
  })
}

export function useTaxSummary({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "tax", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<TaxSummary>>("/reports/sales/tax", {
        params: { from, to },
      })
      return res.data.data
    },
  })
}

// `enabled` defaults to true so standalone callers still work, but
// OrderSourceTab passes its own Pro/Enterprise plan check in — this endpoint
// 403s for a Starter-plan store, so the request is skipped entirely rather
// than firing it just to let it fail (avoids the apiClient interceptor's
// global "no access" toast firing for a state the tab already renders its
// own locked tile for).
export function useOrderSource({ from, to }: DateRangeParams, enabled = true) {
  return useQuery({
    queryKey: ["financial-report", "order-source", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<OrderSourceBreakdown>>(
        "/reports/sales/order-source",
        { params: { from, to } }
      )
      return res.data.data
    },
    enabled,
  })
}

export interface ExportSalesReportParams extends DateRangeParams {
  // Which tab's data to export — passed straight through as `report=`.
  // Every financial-report tab id doubles as its report id 1:1 (including
  // "summary" for Ringkasan), so FinancialReportSection never needs a
  // separate translation table.
  report: string
  // Only meaningful for report="transactions" (mirrors TransactionsTab's
  // own local filters).
  kasirId?: number
  orderNo?: string
  // Only meaningful for report="top-products" (mirrors TopProductsTab's
  // own local sort toggle).
  sort?: TopProductsSort
  limit?: number
}

// GET /reports/sales/export?format=xlsx&report=...&from=&to=&... — binary
// xlsx response, so responseType: "blob" (PDF isn't wired up on this pass;
// the backend 501s for format=pdf and there's no UI for it). A mutation
// rather than a query since it's a one-off, user-triggered download, not
// cached data a tab renders.
export function useExportSalesReport() {
  return useMutation({
    mutationFn: async (params: ExportSalesReportParams) => {
      const res = await apiClient.get<Blob>("/reports/sales/export", {
        params: {
          format: "xlsx",
          report: params.report,
          from: params.from,
          to: params.to,
          kasir_id: params.kasirId,
          order_no: params.orderNo || undefined,
          sort: params.sort,
          limit: params.limit,
        },
        responseType: "blob",
      })
      return res.data
    },
  })
}
