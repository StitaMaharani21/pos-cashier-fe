import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, "Nama bahan wajib diisi"),
  // Picked from INGREDIENT_UNITS in the form. The backend has no unit enum, so
  // an older free-text unit still loads and is kept as it is when editing.
  unit: z.string().trim().min(1, "Satuan wajib dipilih"),
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
