import { z } from "zod"

// Kept as a string field (not z.coerce.number()) so Input/Output stay
// identical — useCrudForm's ZodType<TFormValues, TFormValues> constraint
// (see its own comment) breaks with coercion schemas, same reason
// login.schema.ts sticks to string fields. Converted to a number at submit
// time in CashCountDialog.
export const cashCountSchema = z.object({
  countedAmount: z
    .string()
    .min(1, "Wajib diisi")
    .refine((value) => !Number.isNaN(Number(value)), "Masukkan angka yang valid")
    .refine((value) => Number(value) >= 0, "Jumlah tidak boleh negatif"),
  notes: z.string().optional(),
})

export type CashCountFormValues = z.infer<typeof cashCountSchema>
