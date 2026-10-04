import { useQuery } from "@tanstack/react-query"

import type {
  CashAnomaliesResponse,
  CashierCashSummaryResponse,
  CashVarianceTrendResponse,
  ShiftCashTransactionsResponse,
  ShiftsResponse,
} from "@/modules/owner/cash-report/cash-report.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"

// One useQuery wrapper per GET /reports/cash/* endpoint — same "read-only
// exception" idiom as financial-report.queries.ts (no generic CrudService,
// this module has no create/update/delete).

interface ShiftCashListParams {
  from: string
  to: string
  kasirId?: number
}

export function useShiftCashList({ from, to, kasirId }: ShiftCashListParams) {
  return useQuery({
    queryKey: ["cash-report", "shifts", from, to, kasirId],
    queryFn: async () => {
      // dto.ShiftsResponse on the backend wraps the row list in its own
      // `{ data: [...] }` object (response.Success's envelope adds a SECOND
      // "data" on top of that) — so this needs `.data.data`, not just
      // `.data`, unlike the other hooks below whose response DTOs are
      // themselves the object being unwrapped.
      const res = await apiClient.get<SingleResponse<ShiftsResponse>>("/reports/cash/shifts", {
        params: { from, to, kasir_id: kasirId },
      })
      return res.data.data.data
    },
  })
}

// `shiftId` is null until a table row is clicked (ShiftSummaryTab) — enabled
// only fires once the drill-down Sheet actually has a shift to fetch for, so
// opening the page never triggers N+1 requests for every visible row.
export function useShiftCashTransactions(shiftId: number | null) {
  return useQuery({
    queryKey: ["cash-report", "shift-transactions", shiftId],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<ShiftCashTransactionsResponse>>(
        `/reports/cash/shifts/${shiftId}/transactions`
      )
      return res.data.data
    },
    enabled: shiftId !== null,
  })
}

interface CashierCashSummaryParams {
  from: string
  to: string
}

// "Rekap per Kasir" tab — ranked by |total_variance| desc (backend-sorted,
// see CashierCashSummaryResponse["sorted_by"]).
export function useCashierCashSummary({ from, to }: CashierCashSummaryParams) {
  return useQuery({
    queryKey: ["cash-report", "summary", from, to],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CashierCashSummaryResponse>>(
        "/reports/cash/summary",
        { params: { from, to } }
      )
      return res.data.data
    },
  })
}

// "Tren Selisih" tab — 7/30-day toggle, same shape as dashboard's
// useSalesTrend(days).
export function useCashVarianceTrend(days: 7 | 30) {
  return useQuery({
    queryKey: ["cash-report", "trend", days],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CashVarianceTrendResponse>>(
        "/reports/cash/trend",
        { params: { days } }
      )
      return res.data.data
    },
  })
}

interface CashAnomaliesParams {
  from: string
  to: string
  threshold: number
}

// "Anomali" tab — `threshold` is a local numeric input in AnomaliesTab
// (default 20000), so it's part of the query key like from/to/kasirId
// elsewhere in this file.
export function useCashAnomalies({ from, to, threshold }: CashAnomaliesParams) {
  return useQuery({
    queryKey: ["cash-report", "anomalies", from, to, threshold],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<CashAnomaliesResponse>>(
        "/reports/cash/anomalies",
        { params: { from, to, threshold } }
      )
      return res.data.data
    },
  })
}
