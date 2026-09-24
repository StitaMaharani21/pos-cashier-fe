import { z } from "zod"

// Mirrors pos-kasir-be's dto.CreateProductDiscountRequest/
// UpdateProductDiscountRequest binding tags plus its service-level rules
// (discount_service.go): value must be > 0, and <= 100 when type is
// "percent"; end_date must not be before start_date; menu_ids needs at
// least one entry.
export const productDiscountSchema = z
  .object({
    name: z.string().min(1, "Nama diskon wajib diisi"),
    type: z.enum(["percent", "fixed"]),
    value: z.string().min(1, "Nilai wajib diisi"),
    minimumQty: z.string().optional(),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal berakhir wajib diisi"),
    status: z.enum(["active", "inactive"]),
    menuIds: z.array(z.number()).min(1, "Pilih minimal 1 menu"),
  })
  .refine((v) => Number(v.value) > 0, {
    path: ["value"],
    message: "Nilai harus lebih dari 0",
  })
  .refine((v) => v.type !== "percent" || Number(v.value) <= 100, {
    path: ["value"],
    message: "Diskon persen maksimal 100",
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
    path: ["endDate"],
    message: "Tanggal berakhir tidak boleh sebelum tanggal mulai",
  })

export type ProductDiscountFormValues = z.infer<typeof productDiscountSchema>
