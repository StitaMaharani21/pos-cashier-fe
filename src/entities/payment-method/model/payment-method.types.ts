import type { components } from "@/shared/api/generated/owner-schema"

export type PaymentMethod = components["schemas"]["dto.PaymentMethodResponse"]

// Backend-enforced via `binding:"required,oneof=cash card transfer qris
// ewallet"` on CreatePaymentMethodFormRequest/UpdatePaymentMethodFormRequest
// (internal/master/payment_method/dto). Not generated (see below).
export type PaymentMethodType = "cash" | "card" | "transfer" | "qris" | "ewallet"

// POST/PUT /master/payment-methods are multipart/form-data with each field
// declared as an inline swaggo `formData` param rather than a `$ref`'d body
// DTO, so swagger never emits a `dto.Create/UpdatePaymentMethodRequest`
// schema to generate from (confirmed absent from owner-schema.d.ts) — hand
// written here instead, mirroring the real Go form struct fields.
export interface CreatePaymentMethodPayload {
  name: string
  type: PaymentMethodType
  status?: string
  image?: File | null
}

export interface UpdatePaymentMethodPayload {
  name: string
  type: PaymentMethodType
  status?: string
  image?: File | null
}
