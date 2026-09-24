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

export interface SubmitRegistrationResponse {
  id: number
  // Always "pending" on submit — an internal admin approves (which runs the
  // tenant onboarding) or rejects it afterwards.
  status: "pending" | "approved" | "rejected"
}
