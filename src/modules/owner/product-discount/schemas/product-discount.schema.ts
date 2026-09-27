import { z } from "zod"

import {
  discountBaseShape,
  refineDiscountBase,
} from "@/modules/owner/discount-form/schemas/discount-base.schema"

// Mirrors pos-kasir-be's dto.CreateProductDiscountRequest plus the service
// rules (discount_service.go): the shared value/period rules, at least one
// menu, promo hours filled as a pair and not equal.
export const productDiscountSchema = z
  .object({
    ...discountBaseShape,
    // Minimal Pembelian stepper — per menu line, 1 = no minimum.
    minimumQty: z.number().int().min(1),
    // Subset of mon..sun; all seven = every day.
    activeDays: z.array(z.string()),
    allDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    menuIds: z.array(z.number()).min(1, "Pilih minimal 1 menu"),
  })
  .superRefine((values, ctx) => {
    refineDiscountBase(values, ctx)
    if (values.activeDays.length === 0) {
      ctx.addIssue({ code: "custom", path: ["activeDays"], message: "Pilih minimal 1 hari" })
    }
    if (!values.allDay) {
      if (!values.startTime || !values.endTime) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "Isi jam mulai dan jam selesai" })
      } else if (values.startTime === values.endTime) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "Jam selesai harus berbeda dari jam mulai" })
      }
    }
  })

export type ProductDiscountFormValues = z.infer<typeof productDiscountSchema>
