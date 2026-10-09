import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email belum benar"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
