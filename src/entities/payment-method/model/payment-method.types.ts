import type { components } from "@/shared/api/generated/owner-schema"

export type PaymentMethod = components["schemas"]["dto.PaymentMethodResponse"]

// Backend-enforced via `binding:"required,oneof=cash card transfer qris
// ewallet"` on CreatePaymentMethodFormRequest/UpdatePaymentMethodFormRequest
// (internal/master/payment_method/dto). Not generated (see below).
export type PaymentMethodType = "cash" | "card" | "transfer" | "qris" | "ewallet"

// type=card only (pos-kasir-be payment_method entities AllCardTypes /
// AllCardNetworks). A credit-card payment is charged
// credit_surcharge_percent of the grand total at checkout.
export type CardType = "debit" | "credit"
export type CardNetwork = "visa" | "mastercard" | "gpn" | "jcb" | "amex" | "unionpay"

// POST/PUT /master/payment-methods are multipart/form-data with each field
// declared as an inline swaggo `formData` param rather than a `$ref`'d body
// DTO, so swagger never emits a `dto.Create/UpdatePaymentMethodRequest`
// schema to generate from (confirmed absent from owner-schema.d.ts) — hand
// written here instead, mirroring the real Go form struct fields. The card
// fields are ignored (and cleared) by the backend for non-card types.
export interface PaymentMethodPayload {
  name: string
  type: PaymentMethodType
  status?: string
  image?: File | null
  card_types?: CardType[]
  card_networks?: CardNetwork[]
  credit_surcharge_percent?: number
}

export type CreatePaymentMethodPayload = PaymentMethodPayload
export type UpdatePaymentMethodPayload = PaymentMethodPayload
