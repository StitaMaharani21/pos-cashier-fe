import { z } from "zod"

export const recipeRowSchema = z.object({
  ingredientId: z.string().min(1, "Pilih bahan baku"),
  quantity: z
    .string()
    .min(1, "Jumlah wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, "Jumlah harus lebih dari 0"),
  // Entry unit for `quantity` — may differ from the ingredient's own stock
  // unit (e.g. entering "gram" while the ingredient is tracked in "kg");
  // converted to the ingredient's unit before being sent to the backend.
  unit: z.string().min(1, "Pilih satuan"),
})

export type RecipeRowFormValues = z.infer<typeof recipeRowSchema>
