import { useMutation } from "@tanstack/react-query"

import {
  checkRegistrationStatus,
  submitStoreRegistration,
} from "@/modules/public/store-registration/infrastructure/store-registration.api"
import { ApiError } from "@/shared/api/client"

export function useSubmitRegistration() {
  return useMutation({ mutationFn: submitStoreRegistration })
}

// A mutation (not a query) on purpose: it's an explicit, credentialed lookup
// the visitor triggers — nothing to cache or refetch in the background, and
// the password never lands in a query key.
export function useCheckRegistrationStatus() {
  return useMutation({ mutationFn: checkRegistrationStatus })
}

// Unknown email and wrong password both come back as 401 INVALID_CREDENTIALS
// (deliberately indistinguishable server-side).
export function isStatusCheckRejected(error: unknown): boolean {
  return error instanceof ApiError && error.code === "INVALID_CREDENTIALS"
}

export type RegistrationConflict = "email_active" | "email_pending"

// Both conflicts come back as 409 CONFLICT with no distinct code — told
// apart by pos-kasir-be's error messages (store_registration/service.go
// ErrEmailAlreadyRegistered / ErrRegistrationAlreadyPending).
export function registrationConflict(error: unknown): RegistrationConflict | null {
  if (!(error instanceof ApiError) || error.code !== "CONFLICT") return null
  return error.message.includes("pending") ? "email_pending" : "email_active"
}
