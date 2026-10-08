// Hand-written from pos-kasir-be's internal/central/store_payment_gateway/dto —
// /payment-gateway isn't in ALLOWED_PATH_PREFIXES (scripts/generate-owner-types.mjs),
// same situation as the subscription and capabilities types. Keep in sync
// manually if those Go types change.

export type PaymentGatewayEnvironment = "sandbox" | "production"

// GET /payment-gateway. Never carries the key itself (whole or encrypted) —
// only its last four characters.
export interface PaymentGatewayStatus {
  provider: string
  configured: boolean
  key_last4?: string
  is_active: boolean
  // The server's mode (MIDTRANS_IS_PRODUCTION), not the owner's choice: the
  // key they enter has to match it.
  environment: PaymentGatewayEnvironment
  // Webhook URL attached to every charge. Absent when the server has no
  // APP_PUBLIC_URL, which means online payment can't work yet.
  notification_url?: string
}

export interface SavePaymentGatewayPayload {
  server_key: string
}
