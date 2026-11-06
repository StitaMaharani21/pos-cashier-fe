import { z } from "zod"

export const GROUP_NAME_MAX = 100
export const OPTION_NAME_MAX = 100
export const PRICE_MAX_LENGTH = 9
export const LINKED_QTY_MAX = 99

// Mirrors pos-kasir-be's dto.CreateAddonGroupRequest/AddonOptionRequest. The
// form speaks in plain choices ("Pilih satu" / "Boleh lebih dari satu") and the
// submit handler turns them into the backend's `max_select` (1 = one, 0 = no
// limit, n = up to n). Numbers stay digit strings, like the other forms.
export const addonOptionSchema = z.object({
  // Backend id of an existing option; absent for one added in this form.
  // (Not `id`: react-hook-form's useFieldArray owns that key.)
  optionId: z.number().optional(),
  name: z.string().trim().min(1, "Nama opsi wajib diisi").max(OPTION_NAME_MAX, `Maksimal ${OPTION_NAME_MAX} karakter`),
  // Digits; "" is treated as 0 (no extra charge).
  price: z.string(),
  isActive: z.boolean(),
  // Promo "Beli 1 Gratis 1": the option also takes stock from another menu.
  // Ids as strings (the Select's value); "" = no linked menu / no serving.
  linkedMenuId: z.string(),
  linkedServingOptionId: z.string(),
  // Digits; "" is treated as 1.
  linkedQty: z.string(),
})
  .superRefine((option, ctx) => {
    if (option.linkedMenuId === "") return
    const qty = option.linkedQty === "" ? 1 : Number(option.linkedQty)
    if (!Number.isInteger(qty) || qty < 1 || qty > LINKED_QTY_MAX) {
      ctx.addIssue({ code: "custom", path: ["linkedQty"], message: `Isi 1–${LINKED_QTY_MAX}` })
    }
  })

export const menuAddonSchema = z
  .object({
    name: z.string().trim().min(1, "Nama grup wajib diisi").max(GROUP_NAME_MAX, `Maksimal ${GROUP_NAME_MAX} karakter`),
    selection: z.enum(["single", "multiple"]),
    // Only read for "multiple"; "" = no limit.
    maxSelect: z.string(),
    isRequired: z.boolean(),
    isActive: z.boolean(),
    options: z.array(addonOptionSchema).min(1, "Tambahkan minimal satu opsi"),
    menuIds: z.array(z.number()),
  })
  .superRefine((values, ctx) => {
    if (values.selection === "multiple" && values.maxSelect !== "" && Number(values.maxSelect) < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["maxSelect"],
        message: "Isi 2 atau lebih, atau kosongkan jika tanpa batas",
      })
    }
  })

export type MenuAddonFormValues = z.infer<typeof menuAddonSchema>
