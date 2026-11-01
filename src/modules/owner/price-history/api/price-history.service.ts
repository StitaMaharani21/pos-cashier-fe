import type { PriceHistoryEntityType, PriceHistoryEntry } from "@/entities/price-history/model/price-history.types"
import { apiClient } from "@/shared/api/client"
import type { PaginatedResponse } from "@/shared/api/crud/types"

export interface ListPriceHistoryParams {
  entityType: PriceHistoryEntityType
  entityId: number
  page: number
  perPage: number
}

export interface ListPriceHistoryResult {
  items: PriceHistoryEntry[]
  total: number
  totalPages: number
}

// Throws on failure (unlike the master-data lists) so the sheet can show its
// own error state instead of an empty history that looks like "no changes".
export async function listPriceHistory({
  entityType,
  entityId,
  page,
  perPage,
}: ListPriceHistoryParams): Promise<ListPriceHistoryResult> {
  const response = await apiClient.get<PaginatedResponse<PriceHistoryEntry>>("/master/price-history", {
    params: { entity_type: entityType, entity_id: entityId, page, per_page: perPage },
  })
  return {
    items: response.data.data,
    total: response.data.total,
    totalPages: response.data.total_pages,
  }
}
