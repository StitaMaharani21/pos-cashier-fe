import { z } from "zod"

// `status` has no backend enum (pos-kasir-be accepts any free string) — this
// app self-imposes active/inactive, matching the convention used elsewhere.
export const menuCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
  sortOrder: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>
