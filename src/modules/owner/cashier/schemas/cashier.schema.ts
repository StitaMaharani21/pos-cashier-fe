import { z } from "zod"

// Mirrors pos-kasir-be's dto.CreateCashierRequest binding tags
// (internal/auth/dto/auth_dto.go): name min=3, username min=3, pin
// required len=6 numeric, phone_no optional.
export const cashierSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  pin: z.string().regex(/^\d{6}$/, "PIN harus 6 digit angka"),
  phoneNo: z.string().optional(),
})

export type CashierFormValues = z.infer<typeof cashierSchema>
