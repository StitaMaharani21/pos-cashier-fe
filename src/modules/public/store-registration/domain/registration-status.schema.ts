import { z } from "zod"

import type { CheckRegistrationStatusPayload } from "@/modules/public/store-registration/domain/store-registration.types"

// Mirrors pos-kasir-be's dto.CheckStatusRequest (email ≤150, password
// required). No min length on the password: it's whatever the owner set at
// registration, and a wrong one is answered by the server anyway.
export const registrationStatusSchema = z.object({
  email: z.string().trim().email("Email tidak valid").max(150, "Email maksimal 150 karakter"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
})

export type RegistrationStatusFormValues = z.infer<typeof registrationStatusSchema>

export const EMPTY_STATUS_FORM: RegistrationStatusFormValues = { email: "", password: "" }

export function toStatusPayload(values: RegistrationStatusFormValues): CheckRegistrationStatusPayload {
  return { email: values.email.toLowerCase(), password: values.password }
}
