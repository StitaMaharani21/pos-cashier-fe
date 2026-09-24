import { z } from "zod"

// Mirrors pos-kasir-be's dto.UpdateProfileRequest bindings
// (name: required,min=3,max=150 · phone_no: omitempty,max=30).
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(150, "Nama maksimal 150 karakter"),
  phoneNo: z.string().trim().max(30, "Nomor telepon maksimal 30 karakter"),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
