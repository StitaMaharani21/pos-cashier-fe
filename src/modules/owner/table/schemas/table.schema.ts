import { z } from "zod"

// `number` is the table's label as printed/said ("12", "A3") — the backend
// stores it as free text (max 10 chars). `status` has no backend enum; this app
// self-imposes active/inactive like the other master-data screens.
export const tableSchema = z.object({
  number: z.string().trim().min(1, "Nomor meja wajib diisi").max(10, "Maksimal 10 karakter"),
  status: z.enum(["active", "inactive"]),
})

export type TableFormValues = z.infer<typeof tableSchema>
