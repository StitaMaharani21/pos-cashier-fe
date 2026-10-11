import { z } from "zod"

export const DESCRIPTION_MAX = 150

export const menuSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    // Not typed by the owner: empty on create (the backend generates
    // MNU-001, MNU-002, ...), the existing code on edit.
    code: z.string(),
    name: z.string().trim().min(1, "Nama menu wajib diisi"),
    description: z.string().max(DESCRIPTION_MAX, `Deskripsi maksimal ${DESCRIPTION_MAX} karakter`).optional(),
    // Digits only — the price input formats them as "28.000" for display.
    price: z
      .string()
      .min(1, "Harga wajib diisi")
      .refine((value) => /^\d+$/.test(value) && Number(value) > 0, "Harga harus lebih dari 0"),
    preparationTime: z.string().optional(),
    isAvailable: z.boolean(),
    isFeatured: z.boolean(),
    stockDeductionMethod: z.enum(["none", "by_menu", "by_ingredient"]),
    // Digits only. Required for a NEW by_menu menu (MenuForm checks that on
    // create); on edit, empty keeps the stock as it is — a menu whose stock
    // was never set, or went negative from overselling, must still be
    // savable.
    stockQty: z.string().optional(),
  })

export type MenuFormValues = z.infer<typeof menuSchema>
