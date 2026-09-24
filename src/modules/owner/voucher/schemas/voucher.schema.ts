import { z } from "zod"

// Mirrors pos-kasir-be's dto.CreateVoucherRequest/UpdateVoucherRequest
// binding tags plus its service-level rules (discount_service.go): value
// must be > 0, and <= 100 when type is "percent"; end_date must not be
// before start_date.
export const voucherSchema = z
  .object({
    name: z.string().min(1, "Nama voucher wajib diisi"),
    code: z.string().min(1, "Kode voucher wajib diisi"),
    type: z.enum(["percent", "fixed"]),
    value: z.string().min(1, "Nilai wajib diisi"),
    minimumPurchase: z.string().optional(),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal berakhir wajib diisi"),
    status: z.enum(["active", "inactive"]),
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

export type VoucherFormValues = z.infer<typeof voucherSchema>
