import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { RefundRequest, RefundRequestStatus } from "@/entities/refund-request/model/refund-request.types"
import { apiClient } from "@/shared/api/client"
import type { PaginatedResponse, SingleResponse } from "@/shared/api/crud/types"

// Pengajuan refund dari kasir (pos-kasir-be internal/transaction/refund). Same
// "one hook per endpoint" idiom as cash-report.queries.ts.

export const REFUND_REQUESTS_KEY = "refund-requests"

export const REFUND_REQUEST_PAGE_SIZE = 20

export interface RefundRequestListParams {
  // undefined = every status.
  status?: RefundRequestStatus
  page: number
  search?: string
}

export function useRefundRequests({ status, page, search }: RefundRequestListParams) {
  return useQuery({
    queryKey: [REFUND_REQUESTS_KEY, "list", status ?? "all", page, search ?? ""],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<RefundRequest>>("/refund-requests", {
        params: { page, per_page: REFUND_REQUEST_PAGE_SIZE, status, search: search || undefined },
      })
      return res.data
    },
    placeholderData: (previous) => previous,
  })
}

// The number waiting for a decision: the badge on the sidebar item and the reminder
// on the dashboard. Polled, so a request a cashier just submitted shows up without
// reloading; a failed poll just keeps the last number.
export function usePendingRefundRequestCount(enabled = true) {
  return useQuery({
    queryKey: [REFUND_REQUESTS_KEY, "pending-count"],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<{ count: number }>>("/refund-requests/pending-count")
      return res.data.data.count
    },
    enabled,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}

interface DecisionPayload {
  id: number
  note: string
}

// Approving creates the refund (cash out of the running shift, optional stock
// restore, order status), so the cash summary, the dashboard and the reports refresh.
export function useApproveRefundRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, note }: DecisionPayload) => {
      const res = await apiClient.post<SingleResponse<RefundRequest>>(`/refund-requests/${id}/approve`, { note })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFUND_REQUESTS_KEY] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["cash-report"] })
      queryClient.invalidateQueries({ queryKey: ["financial-report"] })
    },
  })
}

export function useRejectRefundRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, note }: DecisionPayload) => {
      const res = await apiClient.post<SingleResponse<RefundRequest>>(`/refund-requests/${id}/reject`, { note })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFUND_REQUESTS_KEY] })
    },
  })
}

// Every refund request of one order (owner: all of them), newest first. Shown in the
// transaction detail sheet next to the refunds it led to.
export function useOrderRefundRequests(orderId: number | null) {
  return useQuery({
    queryKey: [REFUND_REQUESTS_KEY, "order", orderId],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<RefundRequest[]>>(`/orders/${orderId}/refund-requests`)
      return res.data.data
    },
    enabled: orderId !== null,
  })
}
