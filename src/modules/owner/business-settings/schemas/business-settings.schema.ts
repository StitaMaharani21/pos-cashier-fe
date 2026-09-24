import { z } from "zod"

export const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Nama bisnis wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  phoneNo: z.string().min(1, "Nomor telepon wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  // Mirrors the backend's `binding:"gte=0,lte=100"`.
  taxPercentage: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 0 && Number(value) <= 100),
      "Pajak harus antara 0 dan 100"
    ),
  receiptFooter: z.string().optional(),
})

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>
