import { z } from "zod"

// Forms of the one "Ubah Stok" dialog. Numbers stay strings like the other
// owner forms. `wholeNumber`: menus are counted in whole pieces, ingredients
// can be 0,5 kg.

// "Stok Masuk" (goods received). "" in purchasePrice = leave the purchase price
// unchanged (the incoming goods are costed at the last purchase price).
export function createStockInSchema({ wholeNumber }: { wholeNumber: boolean }) {
  return z.object({
    qty: z
      .string()
      .trim()
      .min(1, "Jumlah wajib diisi")
      .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Jumlah harus lebih dari 0")
      .refine((value) => !wholeNumber || Number.isInteger(Number(value)), "Jumlah harus angka bulat"),
    purchasePrice: z
      .string()
      .trim()
      .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Isi harga beli dengan angka 0 atau lebih"),
    keterangan: z.string().trim().max(500, "Maksimal 500 karakter"),
  })
}

export type StockInFormValues = z.infer<ReturnType<typeof createStockInSchema>>

// "Koreksi": mirrors the backend's AdjustMenuStockRequest / AdjustIngredientStockRequest —
// a non-zero signed amount (either sign) and a required reason (at least 3 characters).
export function createStockAdjustSchema({ wholeNumber }: { wholeNumber: boolean }) {
  return z.object({
    delta: z
      .string()
      .trim()
      .min(1, "Jumlah wajib diisi")
      .refine((value) => Number.isFinite(Number(value)), "Isi jumlah dengan angka")
      .refine((value) => Number(value) !== 0, "Jumlah tidak boleh 0")
      .refine((value) => !wholeNumber || Number.isInteger(Number(value)), "Jumlah harus angka bulat"),
    keterangan: z.string().trim().min(3, "Alasan wajib diisi"),
  })
}

export type StockAdjustFormValues = z.infer<ReturnType<typeof createStockAdjustSchema>>
