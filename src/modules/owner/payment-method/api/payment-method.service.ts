import type {
  PaymentMethod,
  PaymentMethodPayload,
} from "@/entities/payment-method/model/payment-method.types"
import type {
  PaymentChannel,
  PaymentChannelPayload,
} from "@/entities/payment-channel/model/payment-channel.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse, type SingleResponse } from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

// Hand-written, not `createCrudService` — POST/PUT here are
// multipart/form-data (optional image/logo), unlike the plain-JSON resources
// that factory targets. See the feature README.
const METHODS = "/master/payment-methods"
const CHANNELS = "/master/payment-channels"

function methodFormData(payload: PaymentMethodPayload): FormData {
  const formData = new FormData()
  formData.append("name", payload.name)
  formData.append("type", payload.type)
  if (payload.status) formData.append("status", payload.status)
  if (payload.image) formData.append("image", payload.image)
  // Repeated fields (card_types=debit&card_types=credit) — gin binds them
  // into []string. Omitted entirely = empty list.
  payload.card_types?.forEach((value) => formData.append("card_types", value))
  payload.card_networks?.forEach((value) => formData.append("card_networks", value))
  formData.append("credit_surcharge_percent", String(payload.credit_surcharge_percent ?? 0))
  return formData
}

function channelFormData(payload: PaymentChannelPayload): FormData {
  const formData = new FormData()
  formData.append("type", payload.type)
  formData.append("name", payload.name)
  formData.append("status", payload.status)
  formData.append("sort_order", String(payload.sort_order ?? 0))
  return formData
}

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, friendlyErrorMessage(error))
  return new CrudServiceError(
    "UNKNOWN",
    friendlyErrorMessage(error)
  )
}

// A handful of rows at most — fetch one generous page, no pager UI.
export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient.get<PaginatedResponse<PaymentMethod>>(METHODS, {
    params: { page: 1, per_page: 100 },
  })
  return response.data.data
}

export async function createPaymentMethod(payload: PaymentMethodPayload): Promise<PaymentMethod> {
  try {
    const response = await apiClient.post<SingleResponse<PaymentMethod>>(METHODS, methodFormData(payload))
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updatePaymentMethod(
  id: number,
  payload: PaymentMethodPayload
): Promise<PaymentMethod> {
  try {
    const response = await apiClient.put<SingleResponse<PaymentMethod>>(
      `${METHODS}/${id}`,
      methodFormData(payload)
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function listPaymentChannels(): Promise<PaymentChannel[]> {
  const response = await apiClient.get<PaginatedResponse<PaymentChannel>>(CHANNELS, {
    params: { page: 1, per_page: 100 },
  })
  return response.data.data
}

export async function createPaymentChannel(payload: PaymentChannelPayload): Promise<PaymentChannel> {
  try {
    const response = await apiClient.post<SingleResponse<PaymentChannel>>(CHANNELS, channelFormData(payload))
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updatePaymentChannel(
  id: number,
  payload: PaymentChannelPayload
): Promise<PaymentChannel> {
  try {
    const response = await apiClient.put<SingleResponse<PaymentChannel>>(
      `${CHANNELS}/${id}`,
      channelFormData(payload)
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}
