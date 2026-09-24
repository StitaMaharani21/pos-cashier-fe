import type {
  OrderType,
  UpdateOrderTypePayload,
} from "@/entities/order-type/model/order-type.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type SingleResponse } from "@/shared/api/crud/types"

// No create/delete — order types are a fixed set of 3 rows auto-seeded by
// the backend. Hand-written since there's nothing for createCrudService to
// do here (list takes no params, update is the only write).
const RESOURCE = "/master/order-types"

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, error.message)
  return new CrudServiceError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unexpected error"
  )
}

export async function listOrderTypes(): Promise<OrderType[]> {
  try {
    const response = await apiClient.get<SingleResponse<OrderType[]>>(RESOURCE)
    return response.data.data
  } catch (error) {
    console.error("Failed to list order types", error)
    return []
  }
}

export async function updateOrderType(
  id: number,
  payload: UpdateOrderTypePayload
): Promise<OrderType> {
  try {
    const response = await apiClient.put<SingleResponse<OrderType>>(
      `${RESOURCE}/${id}`,
      payload
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}
