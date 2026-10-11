import { z } from "zod"

// String field (not z.coerce.number()) for the same reason as cash-count.schema.ts:
// useCrudForm needs identical input/output types. Converted to a number at
// submit time in CloseShiftDialog. Lebih dari 0 karena backend
// (CloseShiftRequest.closing_balance, binding "required") menolak angka 0.
export const closeShiftSchema = z.object({
  closingBalance: z
    .string()
    .min(1, "Wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)), "Masukkan angka yang valid")
    .refine((value) => Number(value) > 0, "Jumlah uang harus lebih dari 0"),
})

export type CloseShiftFormValues = z.infer<typeof closeShiftSchema>
