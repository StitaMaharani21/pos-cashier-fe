import type {
  SubmitRegistrationPayload,
  SubmitRegistrationResponse,
} from "@/modules/public/store-registration/domain/store-registration.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"
import { env } from "@/shared/config/env"

// POST /internal/store-registrations is public (no token, no X-Store-Code)
// and mounted on the backend's outer router — NOT under /api/v1 like every
// other endpoint (pos-kasir-be cmd/main.go). So resolve it against the API's
// origin instead of apiClient's /api/v1 baseURL (an absolute URL bypasses
// baseURL in axios). Computed per call, not at module load, so this file
// stays safe to import during SSR.
function registrationUrl(): string {
  const apiBase = new URL(env.apiBaseUrl, window.location.origin)
  return new URL("/internal/store-registrations", apiBase).toString()
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
