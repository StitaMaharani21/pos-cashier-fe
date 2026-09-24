import type { ChangePasswordPayload } from "@/entities/auth/model/profile.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError } from "@/shared/api/crud/types"

// Wrong current password comes back as 400 INVALID_CURRENT_PASSWORD (not
// 401 — a 401 would trip the api client's auto-logout), and reusing the
// current password as 400 SAME_PASSWORD; ChangePasswordForm maps both codes
// onto their fields.
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  try {
    await apiClient.put("/me/password", payload)
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
