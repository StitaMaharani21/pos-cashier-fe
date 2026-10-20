import type { components } from "@/shared/api/generated/owner-schema"

// A bank or e-wallet the STORE itself uses (pos-kasir-be
// internal/master/payment_channel) — type "bank" is shared by card and transfer,
// "ewallet" is separate. Not the customer's bank: the cashier may pick one when
// taking a payment, but doesn't have to.
// `mdr_percent` (banks only): this bank's own MDR override, null = the card
// method's MDR Default applies.
// `account_number` / `account_name`: the store's account number (bank) or phone
// number (e-wallet) and its holder, shown to customers who want to transfer;
// "" = not filled in.
// These were added after the generated schema was last refreshed, so they are
// declared here.
export type PaymentChannel = components["schemas"]["dto.PaymentChannelResponse"] & {
  mdr_percent?: number | null
  account_number?: string
  account_name?: string
}

export type PaymentChannelType = "bank" | "ewallet"

// POST/PUT /master/payment-channels are multipart/form-data (optional logo),
// declared as inline formData params — hand-written like the payment method
// payload. PUT without `image` keeps the current logo.
export interface PaymentChannelPayload {
  type: PaymentChannelType
  name: string
  status: "active" | "inactive"
  sort_order?: number
  // Banks only. null/undefined = use the card method's MDR Default.
  mdr_percent?: number | null
  // PUT replaces every field, so resend the saved values ("" clears them).
  account_number?: string
  account_name?: string
}
