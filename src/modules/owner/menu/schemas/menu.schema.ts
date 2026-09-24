import { z } from "zod"

export const menuSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    code: z.string().min(1, "Kode menu wajib diisi"),
    name: z.string().min(1, "Nama menu wajib diisi"),
    description: z.string().optional(),
    price: z
      .string()
      .min(1, "Harga wajib diisi")
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Harga tidak valid"),
    preparationTime: z.string().optional(),
    isAvailable: z.boolean(),
    isFeatured: z.boolean(),
    stockDeductionMethod: z.enum(["none", "by_menu", "by_ingredient"]),
    // Only required when stockDeductionMethod === "by_menu" — see the
    // .refine() below.
    stockQty: z.string().optional(),
  })
  .refine(
    (values) =>
      values.stockDeductionMethod !== "by_menu" ||
      (values.stockQty != null &&
        values.stockQty !== "" &&
        !Number.isNaN(Number(values.stockQty)) &&
        Number(values.stockQty) >= 0),
    { message: "Stok wajib diisi untuk metode Per Menu (satuan)", path: ["stockQty"] }
  )

export type MenuFormValues = z.infer<typeof menuSchema>
