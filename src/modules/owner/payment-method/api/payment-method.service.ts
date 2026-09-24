import type {
  CreatePaymentMethodPayload,
  PaymentMethod,
  UpdatePaymentMethodPayload,
} from "@/entities/payment-method/model/payment-method.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse, type SingleResponse } from "@/shared/api/crud/types"

// Hand-written, not `createCrudService` — POST/PUT here are
// multipart/form-data (name/type/status/image), unlike the plain-JSON
// resources that factory targets. See the feature README for why.
const RESOURCE = "/master/payment-methods"

function toFormData(payload: CreatePaymentMethodPayload | UpdatePaymentMethodPayload): FormData {
  const formData = new FormData()
  formData.append("name", payload.name)
  formData.append("type", payload.type)
  if (payload.status) formData.append("status", payload.status)
  if (payload.image) formData.append("image", payload.image)
  return formData
}

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, error.message)
  return new CrudServiceError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unexpected error"
  )
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    // No pagination UI for this screen (matches Figma — a handful of rows,
    // no pager) — fetch a generously large page instead.
    const response = await apiClient.get<PaginatedResponse<PaymentMethod>>(RESOURCE, {
      params: { page: 1, per_page: 100 },
    })
    return response.data.data
  } catch (error) {
    console.error("Failed to list payment methods", error)
    return []
  }
}

export async function createPaymentMethod(
  payload: CreatePaymentMethodPayload
): Promise<PaymentMethod> {
  try {
    const response = await apiClient.post<SingleResponse<PaymentMethod>>(
      RESOURCE,
      toFormData(payload)
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updatePaymentMethod(
  id: number,
  payload: UpdatePaymentMethodPayload
): Promise<PaymentMethod> {
  try {
    const response = await apiClient.put<SingleResponse<PaymentMethod>>(
      `${RESOURCE}/${id}`,
      toFormData(payload)
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function deletePaymentMethod(id: number): Promise<void> {
  try {
    await apiClient.delete(`${RESOURCE}/${id}`)
  } catch (error) {
    throw toServiceError(error)
  }
}
