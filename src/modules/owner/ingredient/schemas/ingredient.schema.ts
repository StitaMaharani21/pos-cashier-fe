import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, "Nama bahan wajib diisi"),
  // Free text — the backend has no unit/UOM enum for Ingredient.
  unit: z.string().min(1, "Satuan wajib diisi"),
  stock: z
    .string()
    .min(1, "Stok wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Stok tidak valid"),
  minStock: z
    .string()
    .optional()
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Stok minimum tidak valid"
    ),
  purchasePrice: z
    .string()
    .optional()
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Harga beli tidak valid"
    ),
})

export type IngredientFormValues = z.infer<typeof ingredientSchema>
