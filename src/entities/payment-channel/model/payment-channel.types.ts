import type { components } from "@/shared/api/generated/owner-schema"

// A specific bank or e-wallet (pos-kasir-be internal/master/payment_channel).
// The cashier must pick one when paying with a card/transfer (type "bank" —
// the two share one bank list) or an e-wallet (type "ewallet").
export type PaymentChannel = components["schemas"]["dto.PaymentChannelResponse"]

export type PaymentChannelType = "bank" | "ewallet"

// POST/PUT /master/payment-channels are multipart/form-data (optional logo),
// declared as inline formData params — hand-written like the payment method
// payload. PUT without `image` keeps the current logo.
export interface PaymentChannelPayload {
  type: PaymentChannelType
  name: string
  status: "active" | "inactive"
  sort_order?: number
}
