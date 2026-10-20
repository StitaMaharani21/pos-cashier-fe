import { useMutation, useQuery } from "@tanstack/react-query"

import type { OrderDetail } from "@/entities/order/model/order-detail.types"
import type { OrderRefund } from "@/entities/refund/model/refund.types"
import type {
  CashierRanking,
  DailySales,
  CategoryBreakdown,
  DiscountImpact,
  OrderSourceBreakdown,
  PaymentMethodBreakdown,
  PeakHoursHeatmap,
  ReportTransactionListResponse,
  SalesSummary,
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

// One row per date with completed orders (newest first) for the Ringkasan
// breakdown table.
export function useDailySales({ from, to }: DateRangeParams) {
  return useQuery({
    queryKey: ["financial-report", "daily", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<DailySales>>("/reports/sales/daily", {
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
  // pending | diproses | selesai | dibatalkan | direfund (direfund = any
  // refund, partial or full); undefined = every status.
  status?: string
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
            status: params.status || undefined,
            page: params.page,
            per_page: params.perPage,
          },
        }
      )
      return res.data.data
    },
  })
}

// Drill-down for one transaction row. Both are fetched lazily — nothing runs
// until a row is opened (orderId stays null while the drawer is closed).
// GET /orders/{id}/detail is the same payload the cashier app shows; the
// owner may call it on every plan.
export function useOrderDetail(orderId: number | null) {
  return useQuery({
    queryKey: ["financial-report", "order-detail", orderId],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<OrderDetail>>(`/orders/${orderId}/detail`)
      return res.data.data
    },
    enabled: orderId !== null,
  })
}

// Refund history of one order (reason, time, per-item amounts) — the order
// detail only carries `refunded_qty` per item, not when/why.
export function useOrderRefunds(orderId: number | null) {
  return useQuery({
    queryKey: ["financial-report", "order-refunds", orderId],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<OrderRefund[]>>(`/orders/${orderId}/refunds`)
      return res.data.data ?? []
    },
    enabled: orderId !== null,
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
  // Backend report id (`report=`) — NOT always the tab id; the shell maps
  // each tab to one (FinancialReportSection's REPORT_ID).
  report: string
  // Only meaningful for report="transactions" (mirrors TransactionsTab's
  // own filters).
  kasirId?: number
  orderNo?: string
  status?: string
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
          status: params.status || undefined,
          sort: params.sort,
          limit: params.limit,
        },
        responseType: "blob",
      })
      return res.data
    },
  })
}
