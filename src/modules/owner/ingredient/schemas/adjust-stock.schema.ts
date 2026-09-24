import { z } from "zod"

// Mirrors pos-kasir-be's dto.AdjustIngredientStockRequest binding tags
// (internal/master/ingredient/dto/ingredient_dto.go): delta required
// non-zero (either sign — positive for goods received, negative for a
// stock-opname correction), keterangan required.
export const adjustIngredientStockSchema = z.object({
  delta: z
    .string()
    .min(1, "Jumlah wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) !== 0, "Jumlah tidak boleh 0"),
  keterangan: z.string().min(3, "Keterangan wajib diisi"),
})

export type AdjustIngredientStockFormValues = z.infer<typeof adjustIngredientStockSchema>
