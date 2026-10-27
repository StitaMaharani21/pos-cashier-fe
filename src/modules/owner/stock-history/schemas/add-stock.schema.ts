import { z } from "zod"

// Form for "Tambah Stok" (stok masuk). Numbers stay strings like the other
// owner forms; "" in purchasePrice = leave the purchase price unchanged.
// `wholeNumber`: menus are counted in whole pieces, ingredients can be 0,5 kg.
export function createAddStockSchema({ wholeNumber }: { wholeNumber: boolean }) {
  return z.object({
    qty: z
      .string()
      .trim()
      .min(1, "Jumlah wajib diisi")
      .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Jumlah harus lebih dari 0")
      .refine((value) => !wholeNumber || Number.isInteger(Number(value)), "Jumlah harus bilangan bulat"),
    purchasePrice: z
      .string()
      .trim()
      .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Harga beli tidak valid"),
    keterangan: z.string().trim().max(500, "Maksimal 500 karakter"),
  })
}

export type AddStockFormValues = z.infer<ReturnType<typeof createAddStockSchema>>
