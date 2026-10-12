import { z } from "zod"

import { todayInput } from "@/modules/owner/discount-form/lib/discount-rules"
import {
  discountBaseShape,
  refineDiscountBase,
} from "@/modules/owner/discount-form/schemas/discount-base.schema"

// Mirrors pos-kasir-be's dto.CreateVoucherRequest/UpdateVoucherRequest plus
// the service rules (discount_service.go) shared with diskon otomatis.
//
// `reactivating`: the voucher being edited is inactive (switched off, or
// deactivated automatically because its end date passed) and is being switched
// back on. The backend then requires the start date to be today or later
// (`VOUCHER_START_DATE_PAST`), so the form checks it up front.
//
// `savedStartDate` (yyyy-MM-dd): the start date the voucher already has when it
// is being edited. A start date in the past is only accepted when it is exactly
// that saved date (an old, still-running voucher keeps its start); any other
// date before today is refused, for new vouchers too.
export function createVoucherSchema({
  reactivating,
  savedStartDate = "",
}: {
  reactivating: boolean
  savedStartDate?: string
}) {
  return z
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
    .superRefine((values, ctx) => {
      refineDiscountBase(values, ctx)
      const today = todayInput()
      if (!values.startDate || values.startDate >= today) return
      if (reactivating && values.isActive) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Tanggal mulai tidak boleh sebelum hari ini saat mengaktifkan kembali voucher",
        })
      } else if (values.startDate !== savedStartDate) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Tanggal mulai tidak boleh sebelum hari ini",
        })
      }
    })
}

export const voucherSchema = createVoucherSchema({ reactivating: false })

export type VoucherFormValues = z.infer<typeof voucherSchema>
