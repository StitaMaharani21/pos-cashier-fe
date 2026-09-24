import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  DailyTransactionLimit,
  DashboardSummary,
  OrderComposition,
  PaymentMethodValueBreakdown,
  PopularMenu,
  SalesTrend,
} from "@/entities/order/model/order-analytics.types"
import type { RefundSummaryToday } from "@/entities/refund/model/refund.types"
import type {
  CashCount,
  CashSummary,
  RecordCashCountPayload,
} from "@/entities/shift/model/shift.types"
import type { LowStockMenu } from "@/entities/menu/model/menu.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"

// Dashboard is a deliberate exception to the CrudSection pattern (no
// form/table to manage, just read-only widgets) — see ARCHITECTURE.md. Each
// widget gets its own small useQuery wrapper instead of a generic service.

const CASH_SUMMARY_KEY = ["dashboard", "cash-summary"] as const

export function useDailyTransactionLimit() {
  return useQuery({
    queryKey: ["dashboard", "daily-transaction-limit"],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<DailyTransactionLimit>>(
        "/orders/daily-transaction-limit"
      )
      return res.data.data
    },
  })
}

// sinceShiftOpen=true scopes the summary to the currently active shift
// (trx_order.shift_id) instead of the calendar day — see
// DashboardSummary["shift_opened_at"]: nil means either "not asked for" (the
// default calendar-day mode) or "asked for, but no shift is open right now".
// The *_change_percent fields are always 0 in shift mode (no "previous
// shift" to compare against) — callers should hide their delta UI when
// sinceShiftOpen is true, not rely on those fields being absent.
export function useDashboardSummary(sinceShiftOpen = false) {
  return useQuery({
    queryKey: ["dashboard", "dashboard-summary", sinceShiftOpen],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<DashboardSummary>>(
        "/orders/dashboard-summary",
        { params: sinceShiftOpen ? { since_shift_open: true } : undefined }
      )
      return res.data.data
    },
  })
}

// GetCashSummary 404s when the owner has no active shift right now — that's
// a normal state (not an error toast), so callers should check `isError` /
// `error` and render a "tidak ada shift aktif" state rather than surfacing it.
export function useCashSummary() {
  return useQuery({
    queryKey: CASH_SUMMARY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CashSummary>>(
        "/shifts/cash-summary"
      )
      return res.data.data
    },
    retry: false,
  })
}

export function useRefundSummaryToday() {
  return useQuery({
    queryKey: ["dashboard", "refund-summary-today"],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<RefundSummaryToday>>(
        "/refunds/summary-today"
      )
      return res.data.data
    },
  })
}

export function usePopularMenu(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "popular-menu", limit],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<PopularMenu[]>>(
        "/orders/popular-menu",
        { params: { limit } }
      )
      return res.data.data
    },
  })
}

export function usePaymentMethodValueBreakdown() {
  return useQuery({
    queryKey: ["dashboard", "payment-method-value-breakdown"],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<PaymentMethodValueBreakdown[]>>(
        "/orders/payment-method-value-breakdown"
      )
      return res.data.data
    },
  })
}

export function useSalesTrend(days: 7 | 30) {
  return useQuery({
    queryKey: ["dashboard", "sales-trend", days],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<SalesTrend>>(
        "/orders/sales-trend",
        { params: { days } }
      )
      return res.data.data
    },
  })
}

export function useLowStockMenus() {
  return useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: async () => {
      // LowStockCard renders its own "requires Pro" message on 403.
      const res = await apiClient.get<SingleResponse<LowStockMenu[]>>(
        "/master/menus/low-stock",
        { skipForbiddenToast: true }
      )
      return res.data.data
    },
  })
}

export function useOrderComposition() {
  return useQuery({
    queryKey: ["dashboard", "order-composition"],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<OrderComposition>>(
        "/orders/order-composition"
      )
      return res.data.data
    },
  })
}

export function useRecordCashCount(shiftId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RecordCashCountPayload) => {
      if (!shiftId) throw new Error("No active shift to record a cash count against.")
      const res = await apiClient.post<SingleResponse<CashCount>>(
        `/shifts/${shiftId}/cash-counts`,
        payload
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASH_SUMMARY_KEY })
    },
  })
}
