import type {
  Cashier,
  CashierLimitStatus,
  CreateCashierPayload,
  UpdateCashierStatusPayload,
} from "@/entities/cashier/model/cashier.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse, type SingleResponse } from "@/shared/api/crud/types"

// Create + list + a narrow status toggle only — the backend has no full
// "edit" (PUT) for a cashier, so `shared/api/crud/createCrudService` doesn't
// apply here (same reasoning as `business-settings.service.ts` for its
// singleton GET+PUT — see this module's README).
const RESOURCE = "/auth/users/cashier"

function toCrudServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) {
    return new CrudServiceError(error.code, error.message)
  }
  return new CrudServiceError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unexpected error"
  )
}

export async function listCashiers(page: number, perPage: number): Promise<Cashier[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Cashier>>(RESOURCE, {
      params: { page, per_page: perPage },
    })
    return response.data.data
  } catch (error) {
    console.error("Failed to list cashiers", error)
    return []
  }
}

// 500/network failures degrade to null (same "not an error to surface"
// treatment as `business-settings.service.ts`'s getBusinessSettings) — the
// quota card just shows its loading/empty state instead of crashing.
export async function getCashierLimit(): Promise<CashierLimitStatus | null> {
  try {
    const response = await apiClient.get<SingleResponse<CashierLimitStatus>>(
      `${RESOURCE}/limit`
    )
    return response.data.data
  } catch (error) {
    console.error("Failed to get cashier limit status", error)
    return null
  }
}

export async function createCashier(payload: CreateCashierPayload): Promise<Cashier> {
  try {
    const response = await apiClient.post<SingleResponse<Cashier>>(RESOURCE, payload)
    return response.data.data
  } catch (error) {
    throw toCrudServiceError(error)
  }
}

// Multipart, field "photo" — the create endpoint is JSON-only, so a photo
// picked in the create form is sent right after (see CashierSection).
export async function uploadCashierPhoto(id: number, photo: File): Promise<Cashier> {
  try {
    const formData = new FormData()
    formData.append("photo", photo)
    const response = await apiClient.put<SingleResponse<Cashier>>(`${RESOURCE}/${id}/photo`, formData)
    return response.data.data
  } catch (error) {
    throw toCrudServiceError(error)
  }
}

export async function deleteCashierPhoto(id: number): Promise<Cashier> {
  try {
    const response = await apiClient.delete<SingleResponse<Cashier>>(`${RESOURCE}/${id}/photo`)
    return response.data.data
  } catch (error) {
    throw toCrudServiceError(error)
  }
}

export async function updateCashierStatus(
  id: number,
  payload: UpdateCashierStatusPayload
): Promise<void> {
  try {
    await apiClient.patch(`${RESOURCE}/${id}/status`, payload)
  } catch (error) {
    throw toCrudServiceError(error)
  }
}
