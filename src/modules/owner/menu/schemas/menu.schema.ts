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
    // Stok minimum (pcs), only for a per-menu tracked menu: stock at or under it
    // reads "Menipis". Whole number >= 0; empty = the default.
    minStock: z
      .string()
      .optional()
      .refine((value) => !value || /^\d+$/.test(value), "Isi stok minimum dengan bilangan bulat 0 atau lebih"),
    // Harga pokok per porsi/pcs, only for a menu without a recipe (the recipe
    // costs the rest). Empty = not known / unchanged.
    costPrice: z
      .string()
      .optional()
      .refine((value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0), "Isi harga pokok dengan angka 0 atau lebih"),
  })

export type MenuFormValues = z.infer<typeof menuSchema>
