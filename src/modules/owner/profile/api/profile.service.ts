import type {
  Profile,
  UpdateProfilePayload,
} from "@/entities/auth/model/profile.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type SingleResponse } from "@/shared/api/crud/types"

// Self-service, not a CRUD resource — always the caller's own account, so
// `createCrudService` doesn't apply (same reasoning as business-settings).
const PROFILE = "/me/profile"

function toCrudServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) {
    return new CrudServiceError(error.code, error.message)
  }
  return new CrudServiceError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unexpected error"
  )
}

export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<SingleResponse<Profile>>(PROFILE)
  return response.data.data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  try {
    const response = await apiClient.put<SingleResponse<Profile>>(PROFILE, payload)
    return response.data.data
  } catch (error) {
    throw toCrudServiceError(error)
  }
}
