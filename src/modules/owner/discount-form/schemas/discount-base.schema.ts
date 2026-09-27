import { z } from "zod"

import { NAME_MAX } from "@/modules/owner/discount-form/lib/discount-rules"

// Fields the voucher and the diskon-otomatis drawers share — same names in
// both form schemas, so the shared field components below can read them
// through useFormContext<DiscountBaseValues>(). Numbers are kept as digit
// strings (the inputs format them as "10.000").
export const discountBaseShape = {
  name: z.string().trim().min(1, "Nama wajib diisi").max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`),
  isActive: z.boolean(),
  type: z.enum(["percent", "fixed"]),
  value: z.string(),
  // "" = tanpa batas. Percent only.
  maxDiscount: z.string(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  // "" = tanpa batas (the backend stores NULL: never expires).
  endDate: z.string(),
}

export interface DiscountBaseValues {
  name: string
  isActive: boolean
  type: "percent" | "fixed"
  value: string
  maxDiscount: string
  startDate: string
  endDate: string
}

// Mirrors discount_service.go's rules: value > 0 and ≤ 100 for percent;
// end_date not before start_date.
export function refineDiscountBase(values: DiscountBaseValues, ctx: z.RefinementCtx) {
  const value = Number(values.value)
  if (!values.value || !(value > 0)) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "Nilai diskon harus lebih dari 0" })
  } else if (values.type === "percent" && value > 100) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "Diskon persen maksimal 100%" })
  }
  if (values.endDate && values.startDate && values.endDate < values.startDate) {
    ctx.addIssue({ code: "custom", path: ["endDate"], message: "Tanggal selesai tidak boleh sebelum tanggal mulai" })
  }
}
