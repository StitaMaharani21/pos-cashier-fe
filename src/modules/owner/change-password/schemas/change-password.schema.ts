import { z } from "zod"

// Mirrors pos-kasir-be's dto.ChangePasswordRequest (new_password: min=8).
// The confirmation and "must differ" checks are client-side only — the
// backend also rejects a reused password (SAME_PASSWORD), this just catches
// it before the round trip.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Ulangi kata sandi baru"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "Kata sandi baru harus berbeda dari yang lama",
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
