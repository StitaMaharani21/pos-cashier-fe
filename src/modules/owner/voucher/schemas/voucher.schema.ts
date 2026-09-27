import { z } from "zod"

import {
  discountBaseShape,
  refineDiscountBase,
} from "@/modules/owner/discount-form/schemas/discount-base.schema"

// Mirrors pos-kasir-be's dto.CreateVoucherRequest/UpdateVoucherRequest plus
// the service rules (discount_service.go) shared with diskon otomatis.
export const voucherSchema = z
  .object({
    ...discountBaseShape,
    code: z
      .string()
      .trim()
      .min(1, "Kode voucher wajib diisi")
      .max(50, "Kode voucher maksimal 50 karakter")
      .regex(/^\S+$/, "Kode voucher tidak boleh mengandung spasi"),
    // Digits; "" = tanpa minimum.
    minimumPurchase: z.string(),
  })
  .superRefine(refineDiscountBase)

export type VoucherFormValues = z.infer<typeof voucherSchema>
