import axios from "axios"

import type {
  PaymentGatewayStatus,
  SavePaymentGatewayPayload,
} from "@/entities/payment-gateway/model/payment-gateway.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type SingleResponse } from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

// Singleton owned by the store: GET (status), PUT (save key), DELETE (remove
// key) — no list/create/update, so `createCrudService` doesn't apply.
const RESOURCE = "/payment-gateway"

// Error codes the form/section branch on.
export const FEATURE_NOT_IN_PLAN = "FEATURE_NOT_IN_PLAN"

export const PAYMENT_GATEWAY_QUERY_KEY = ["payment-gateway"]
// Saving or removing the key also creates/disables the managed "QRIS Midtrans"
// payment method, so that list has to be refetched too.
export const PAYMENT_METHODS_QUERY_KEY = ["payment-methods"]

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, friendlyErrorMessage(error))
  // The api client's interceptor already opened the upsell modal and refetched
  // capabilities for a 402, and rejects with the raw AxiosError (the flat 402
  // body has no `message`, so it isn't an ApiError). Callers skip the toast
  // for this code — the modal is the feedback.
  if (axios.isAxiosError(error) && error.response?.status === 402) {
    return new CrudServiceError(FEATURE_NOT_IN_PLAN, "Fitur ini tersedia di Paket Pro")
  }
  return new CrudServiceError(
    "UNKNOWN",
    friendlyErrorMessage(error)
  )
}

export async function getPaymentGateway(): Promise<PaymentGatewayStatus> {
  try {
    const response = await apiClient.get<SingleResponse<PaymentGatewayStatus>>(RESOURCE)
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

// The backend checks the key's shape and pings Midtrans with it before
// storing it (encrypted), then switches on the "QRIS Midtrans" payment method.
export async function savePaymentGateway(
  payload: SavePaymentGatewayPayload
): Promise<PaymentGatewayStatus> {
  try {
    const response = await apiClient.put<SingleResponse<PaymentGatewayStatus>>(RESOURCE, payload)
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function removePaymentGateway(): Promise<void> {
  try {
    await apiClient.delete(RESOURCE)
  } catch (error) {
    throw toServiceError(error)
  }
}
