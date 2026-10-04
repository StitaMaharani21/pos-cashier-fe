import type {
  CheckRegistrationStatusPayload,
  CheckRegistrationStatusResponse,
  CreateRegistrationPaymentPayload,
  RegistrationPayment,
  RegistrationPaymentStatusPayload,
  SubmitRegistrationPayload,
  SubmitRegistrationResponse,
} from "@/modules/public/store-registration/domain/store-registration.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"
import { env } from "@/shared/config/env"

// POST /internal/store-registrations{,/status} are public (no token, no
// X-Store-Code) and mounted on the backend's outer router — NOT under /api/v1
// like every other endpoint (pos-kasir-be cmd/main.go). So resolve them
// against the API's origin instead of apiClient's /api/v1 baseURL (an
// absolute URL bypasses baseURL in axios). Computed per call, not at module
// load, so this file stays safe to import during SSR.
function registrationUrl(path = ""): string {
  const apiBase = new URL(env.apiBaseUrl, window.location.origin)
  return new URL(`/internal/store-registrations${path}`, apiBase).toString()
}

export async function submitStoreRegistration(
  payload: SubmitRegistrationPayload
): Promise<SubmitRegistrationResponse> {
  const response = await apiClient.post<SingleResponse<SubmitRegistrationResponse>>(
    registrationUrl(),
    payload
  )
  return response.data.data
}

// Creates the QRIS charge for the visitor's own pending registration. The
// backend reuses a still-valid QR (or returns the paid one) instead of
// charging twice, so calling this again after closing the dialog is safe.
export async function createRegistrationPayment(
  payload: CreateRegistrationPaymentPayload
): Promise<RegistrationPayment> {
  const response = await apiClient.post<SingleResponse<RegistrationPayment>>(
    registrationUrl("/payment"),
    payload
  )
  return response.data.data
}

export async function getRegistrationPayment(
  payload: RegistrationPaymentStatusPayload
): Promise<RegistrationPayment> {
  const response = await apiClient.post<SingleResponse<RegistrationPayment>>(
    registrationUrl("/payment/status"),
    payload
  )
  return response.data.data
}

export async function checkRegistrationStatus(
  payload: CheckRegistrationStatusPayload
): Promise<CheckRegistrationStatusResponse> {
  const response = await apiClient.post<SingleResponse<CheckRegistrationStatusResponse>>(
    registrationUrl("/status"),
    payload
  )
  return response.data.data
}
