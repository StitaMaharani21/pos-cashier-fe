import type { components } from "@/shared/api/generated/owner-schema"

// `provider` isn't in the generated schema yet (it lags the backend): set to
// "midtrans" for the managed "QRIS Midtrans" method that saving the store's own
// Midtrans key creates (type "qris"). Managed methods are read-only in the CRUD
// (409 PAYMENT_METHOD_MANAGED) — see modules/owner/payment-gateway.
// `mdr_percent` (card only): the MDR Default, likewise newer than the schema.
export type PaymentMethod = components["schemas"]["dto.PaymentMethodResponse"] & {
  provider?: string
  mdr_percent?: number
}

// Backend-enforced via `binding:"required,oneof=cash card transfer qris
// ewallet"` on CreatePaymentMethodFormRequest/UpdatePaymentMethodFormRequest
// (internal/master/payment_method/dto). Not generated (see below).
export type PaymentMethodType = "cash" | "card" | "transfer" | "qris" | "ewallet"

// type=card only (pos-kasir-be payment_method entities AllCardTypes). MDR
// (mdr_percent) applies to debit and credit alike; it is the merchant's fee to
// the bank, recorded per payment and never added to the customer's total.
export type CardType = "debit" | "credit"

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
  mdr_percent?: number
}

export type CreatePaymentMethodPayload = PaymentMethodPayload
export type UpdatePaymentMethodPayload = PaymentMethodPayload
