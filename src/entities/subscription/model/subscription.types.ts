// Hand-transcribed from pos-kasir-be's internal/central/subscription_payment/dto
// (and internal/central/device/dto for the quota). Not generated:
// scripts/generate-owner-types.mjs leaves /subscriptions out on purpose, same
// as the other billing endpoints. Keep in sync manually.

// GET /subscriptions/plans — the catalogue the backend charges from. `price`
// is whole rupiah; the page never computes a charge, it only displays this.
export interface SubscriptionPlan {
  plan_id: number
  code: string
  name: string
  price: number
  duration_days: number
}

export interface OwnedAddon {
  code: string
  qty: number
  // RFC3339; absent = no expiry (granted by Neela's team).
  expires_at?: string
}

// GET /subscriptions/current
export interface CurrentSubscription {
  plan: string
  // RFC3339; absent = no end date is recorded for this store.
  renew_at?: string
  addons: OwnedAddon[]
}

// GET /subscriptions/addons — one catalogue row plus what it means for THIS
// store, enough to pick the button without re-deriving the rules.
export interface AddonCatalogItem {
  code: string
  name: string
  price: number
  duration_days: number
  // true = the price is per unit and a quantity can be chosen (devices).
  per_unit: boolean
  // On sale AND buyable by this store right now (not already part of its
  // plan, not a permanent grant).
  purchasable: boolean
  included_in_plan: boolean
  owned_qty: number
  // RFC3339; absent when not owned or `permanent`.
  active_until?: string
  permanent: boolean
}

export type SubscriptionPaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED"

// POST /subscriptions/payments, POST /subscriptions/addon-payments and
// GET /subscriptions/payments/:id share this shape. Core API QRIS: the QR is
// drawn from `qr_string`, then the status is polled.
export interface SubscriptionPayment {
  payment_id: number
  order_id: string
  plan_id: number
  // Plan code, or the add-on code when kind is "addon".
  plan_code: string
  amount: number
  status: SubscriptionPaymentStatus
  qr_string?: string
  // RFC3339
  expires_at?: string
  paid_at?: string
  kind: "plan" | "addon"
  addon_code?: string
  qty?: number
}

// GET /devices/quota
export interface DeviceQuota {
  limit: number
  used: number
  base: number
  extra: number
  unlimited: boolean
}
