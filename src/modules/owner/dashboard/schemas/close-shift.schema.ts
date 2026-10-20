import { z } from "zod"

// String fields (not z.coerce.number()) for the same reason as
// cash-count.schema.ts: useCrudForm needs identical input/output types.
// closingBalance is converted to a number at submit time in CloseShiftDialog.
// 0 is valid (an empty drawer is a real count — it just shows up as a
// shortage). `notes` is required only when the count differs from the
// expected cash; that rule needs the expected amount, so CloseShiftDialog
// enforces it at submit instead of here.
export const closeShiftSchema = z.object({
  closingBalance: z
    .string()
    .min(1, "Wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)), "Masukkan angka yang valid")
    .refine((value) => Number(value) >= 0, "Jumlah uang tidak boleh negatif"),
  notes: z.string().optional(),
})

export type CloseShiftFormValues = z.infer<typeof closeShiftSchema>
