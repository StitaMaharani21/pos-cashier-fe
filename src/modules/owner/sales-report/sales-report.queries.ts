import { useQuery } from "@tanstack/react-query"

import type { FinancialReportListResponse } from "@/entities/order/model/order-analytics.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"

// Same "read-only exception" idiom as dashboard.queries.ts — one useQuery
// wrapper per endpoint, no generic CrudService (this resource has no
// create/update/delete).
interface FinancialReportParams {
  startDate: string
  endDate: string
  cashierId?: number
  paymentMethodId?: number
  search?: string
  page: number
  perPage: number
}

export function useFinancialReport(params: FinancialReportParams) {
  return useQuery({
    queryKey: ["sales-report", "financial-report", params],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse<FinancialReportListResponse>>(
        "/orders/financial-report",
        {
          params: {
            start_date: params.startDate,
            end_date: params.endDate,
            cashier_id: params.cashierId,
            payment_method_id: params.paymentMethodId,
            search: params.search || undefined,
            page: params.page,
            per_page: params.perPage,
          },
        }
      )
      // Double-nested envelope: SingleResponse<T> where T itself carries
      // {data, total, page, per_page, total_pages, page_summary} — unlike
      // the flat PaginatedResponse<T> most list endpoints use.
      return res.data.data
    },
  })
}
