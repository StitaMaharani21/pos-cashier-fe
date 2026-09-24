import { z } from "zod"

export const PAYMENT_METHOD_TYPES = ["cash", "card", "transfer", "qris", "ewallet"] as const

export const PAYMENT_METHOD_TYPE_LABELS: Record<(typeof PAYMENT_METHOD_TYPES)[number], string> = {
  cash: "Tunai (Cash)",
  card: "Kartu Debit / Kredit",
  transfer: "Transfer Bank",
  qris: "QRIS",
  ewallet: "E-Wallet",
}

// The QRIS image is validated separately in the form component (it's plain
// File state, not an RHF-bound field) since the user asked for it to be
// required specifically when type=qris, stricter than the backend itself.
export const paymentMethodSchema = z.object({
  // Not typed by the user anymore — derived from type + the provider picker
  // (see constants/payment-providers.ts).
  name: z.string().min(1, "Pilih provider terlebih dahulu"),
  type: z.enum(PAYMENT_METHOD_TYPES),
  status: z.enum(["active", "inactive"]),
})

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>
