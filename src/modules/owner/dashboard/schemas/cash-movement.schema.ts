import { z } from "zod"

// String amount (not z.coerce.number()) for the same reason as
// cash-count.schema.ts: useCrudForm needs identical input/output types, so it
// is converted to a number at submit time in CashMovementDialog.
export const cashMovementSchema = z.object({
  type: z.enum(["in", "out"]),
  amount: z
    .string()
    .min(1, "Wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)), "Masukkan angka yang valid")
    .refine((value) => Number(value) > 0, "Nominal harus lebih dari 0"),
  // Required: an unexplained cash movement is exactly what the reconciliation
  // can't explain later.
  description: z
    .string()
    .trim()
    .min(1, "Keterangan wajib diisi")
    .max(500, "Maksimal 500 karakter"),
})

export type CashMovementFormValues = z.infer<typeof cashMovementSchema>
export type CashMovementType = CashMovementFormValues["type"]
