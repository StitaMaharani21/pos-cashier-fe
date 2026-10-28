import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, "Nama bahan wajib diisi"),
  // Free text — the backend has no unit/UOM enum for Ingredient.
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi")
    .refine((value) => Number.isNaN(Number(value)), "Isi nama satuan, mis. gram, kg, ml, pcs"),
  stock: z
    .string()
    .min(1, "Stok wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Isi stok dengan angka 0 atau lebih"),
  minStock: z
    .string()
    .optional()
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Isi batas stok dengan angka 0 atau lebih"
    ),
  purchasePrice: z
    .string()
    .optional()
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Isi harga beli dengan angka 0 atau lebih"
    ),
})

export type IngredientFormValues = z.infer<typeof ingredientSchema>
