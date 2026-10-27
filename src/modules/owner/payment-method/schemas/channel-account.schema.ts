import { z } from "zod"

import { accountNumberError } from "@/modules/owner/payment-method/components/method-draft"

// One bank account / e-wallet account of the store (a payment channel row).
export const channelAccountSchema = z.object({
  provider: z.string().min(1, "Pilih bank atau e-wallet"),
  accountNumber: z
    .string()
    .trim()
    .min(1, "Nomor wajib diisi")
    .superRefine((value, ctx) => {
      const problem = accountNumberError(value)
      if (problem) ctx.addIssue({ code: "custom", message: problem })
    }),
  accountName: z.string().trim().min(1, "Atas nama wajib diisi").max(100, "Maksimal 100 karakter"),
})

export type ChannelAccountFormValues = z.infer<typeof channelAccountSchema>
