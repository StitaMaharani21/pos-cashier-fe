import { useMutation } from "@tanstack/react-query"

import { submitStoreRegistration } from "@/modules/public/store-registration/infrastructure/store-registration.api"
import { ApiError } from "@/shared/api/client"

export function useSubmitRegistration() {
  return useMutation({ mutationFn: submitStoreRegistration })
}

export type RegistrationConflict = "email_active" | "email_pending"

// Both conflicts come back as 409 CONFLICT with no distinct code — told
// apart by pos-kasir-be's error messages (store_registration/service.go
// ErrEmailAlreadyRegistered / ErrRegistrationAlreadyPending).
export function registrationConflict(error: unknown): RegistrationConflict | null {
  if (!(error instanceof ApiError) || error.code !== "CONFLICT") return null
  return error.message.includes("pending") ? "email_pending" : "email_active"
}
