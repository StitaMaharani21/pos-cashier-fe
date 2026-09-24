import { isAxiosError } from "axios"

import type {
  BusinessSettings,
  UpdateBusinessSettingsPayload,
} from "@/entities/business-settings/model/business-settings.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type SingleResponse } from "@/shared/api/crud/types"

// Singleton GET+PUT, no create/delete/list — hand-written per the feature's
// README, `createCrudService` doesn't apply here.
const RESOURCE = "/master/business-settings"

// 404 means the settings row hasn't been created yet ("created
// automatically on first update", per the backend's own doc comment) — a
// normal empty state, not an error to surface. Anything else (network, 5xx)
// is a real failure and must not masquerade as "no settings yet", or saving
// the empty form would overwrite the real data.
export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const response = await apiClient.get<SingleResponse<BusinessSettings>>(RESOURCE)
    return response.data.data
  } catch (error) {
    const status =
      error instanceof ApiError
        ? error.status
        : isAxiosError(error)
          ? error.response?.status
          : undefined
    if (status === 404) return null
    throw error
  }
}

function toFormData(payload: UpdateBusinessSettingsPayload): FormData {
  const formData = new FormData()
  formData.append("business_name", payload.business_name)
  formData.append("address", payload.address)
  formData.append("phone_no", payload.phone_no)
  formData.append("email", payload.email)
  formData.append("tax_percentage", String(payload.tax_percentage))
  formData.append("receipt_footer", payload.receipt_footer)
  if (payload.logo) formData.append("logo", payload.logo)
  return formData
}

// multipart/form-data (optional `logo` file) — the backend keeps the current
// logo when none is sent.
export async function updateBusinessSettings(
  payload: UpdateBusinessSettingsPayload
): Promise<BusinessSettings> {
  try {
    const response = await apiClient.put<SingleResponse<BusinessSettings>>(
      RESOURCE,
      toFormData(payload)
    )
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw new CrudServiceError(error.code, error.message)
    }
    throw new CrudServiceError(
      "UNKNOWN",
      error instanceof Error ? error.message : "Unexpected error"
    )
  }
}
