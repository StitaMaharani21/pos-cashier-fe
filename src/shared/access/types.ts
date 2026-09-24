// Hand-transcribed from pos-kasir-be's internal/capability/handler.go,
// internal/entitlement/{feature,entitlement}.go and internal/rbac/module.go —
// GET /me/capabilities isn't in ALLOWED_PATH_PREFIXES (scripts/generate-owner-types.mjs),
// same situation as entities/auth/model/auth.types.ts's LoginResponse. Keep in
// sync manually if those Go types change.

// `Feature` is `type Feature string` on the Go side (not a closed enum), but
// entitlement.AllFeatures() only ever returns these 8 values today.
export type Feature =
  | "pos"
  | "shift"
  | "discount"
  | "reports"
  | "inventory_full"
  | "qr_self_order"
  | "multi_outlet"
  | "custom_rbac"

// rbac.AllModules() — 14 modules.
export type Module =
  | "dashboard"
  | "pos"
  | "void"
  | "refund"
  | "shift"
  | "menu"
  | "payment_method"
  | "discount"
  | "inventory"
  | "table"
  | "user"
  | "backup"
  | "settings"
  | "report"

export type Action = "view" | "create" | "edit" | "delete"

export type UpgradeHint = "ADDON" | "UPGRADE_PRO" | "UPGRADE_ENTERPRISE"

export interface Capabilities {
  plan: "starter" | "pro" | "enterprise"
  addons: string[]
  features: Feature[]
  locked: { feature: Feature; upgrade_hint: UpgradeHint }[]
  hidden: Feature[]
  // Module absent from this map means the store's plan doesn't include the
  // feature that module requires (rbac.FeatureForModule) — not "present with
  // an empty array". useCapabilities().can() already treats both the same way.
  permissions: Partial<Record<Module, Action[]>>
  role: { name: string; is_owner: boolean }
}

export type FeatureState = "open" | "locked" | "hidden"
