// Hand-transcribed from pos-kasir-be's internal/central/store_registration/dto
// (SubmitRegistrationRequest/Response). Not generated: that endpoint lives in
// the separate "internal" swagger instance (docs/internaldocs), which
// scripts/generate-owner-types.mjs doesn't read. Keep in sync manually.
export interface SubmitRegistrationPayload {
  store_name: string
  address: string
  phone_no: string
  owner_name: string
  owner_username: string
  owner_email: string
  owner_phone_no: string
  password: string
}

export type RegistrationStatus = "pending" | "approved" | "rejected"

export interface SubmitRegistrationResponse {
  id: number
  // Always "pending" on submit — an internal admin approves (which runs the
  // tenant onboarding) or rejects it afterwards.
  status: RegistrationStatus
}

// POST /internal/store-registrations/status (dto.CheckStatusRequest/Response).
// The owner has no account until approval, so the email + password chosen at
// registration are the proof of ownership.
export interface CheckRegistrationStatusPayload {
  email: string
  password: string
}

// "Beli langsung" — paying for Starter (1 month) while registering, before the
// account exists. POST /internal/store-registrations/payment and
// /payment/status (dto.CreateRegistrationPaymentRequest /
// RegistrationPaymentStatusRequest). Same proof of ownership as the status
// check: the email + password chosen at registration.
export type CreateRegistrationPaymentPayload = CheckRegistrationStatusPayload

export interface RegistrationPaymentStatusPayload extends CheckRegistrationStatusPayload {
  payment_id: number
}

// PENDING until Midtrans confirms; the backend reports a PENDING QR past its
// expiry as EXPIRED so polling can stop. The other finals are terminal too.
export type RegistrationPaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED"

// subscriptionpayment dto.SubscriptionPaymentResponse (the owner's
// /subscriptions/payments uses the same shape). Core API QRIS, not Snap: the
// FE renders the QR from `qr_string` (raw QRIS payload) and polls the status.
export interface RegistrationPayment {
  payment_id: number
  order_id: string
  transaction_id?: string
  plan_id: number
  plan_code: string
  // Whole rupiah, from the backend's plan catalogue — never computed here.
  amount: number
  status: RegistrationPaymentStatus
  qr_url?: string
  qr_string?: string
  // RFC3339
  expires_at?: string
  paid_at?: string
}

export interface CheckRegistrationStatusResponse {
  id: number
  store_name: string
  status: RegistrationStatus
  // Only set on a rejection where the admin gave a reason.
  rejection_reason?: string
  created_at: string
  // Set once an admin has approved/rejected it.
  processed_at?: string
}
