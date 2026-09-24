import type { Feature, Module } from "@/shared/access/types"

interface AccessRule {
  feature?: Feature
  module?: Module
}

// Single source of truth for "which feature/module gates this /app/* route",
// consumed by both AppRouter (RequireAccess on each route) and OwnerLayout
// (locked/hidden state + lock icon in the sidebar) so the two never drift
// apart. Keyed by the same path passed to <Route path="...">.
export const routeAccess: Record<string, AccessRule> = {
  "": { feature: "pos", module: "dashboard" }, // index route ("/app")
  menu: { feature: "pos", module: "menu" },
  "menu-category": { feature: "pos", module: "menu" },
  ingredient: { feature: "inventory_full", module: "inventory" },
  "payment-method": { feature: "pos", module: "payment_method" },
  "order-type": { feature: "pos", module: "menu" },
  table: { feature: "qr_self_order", module: "table" },
  users: { feature: "pos", module: "user" },
  voucher: { feature: "discount", module: "discount" },
  "discount-auto": { feature: "discount", module: "discount" },
  "sales-report": { feature: "reports", module: "report" },
  "cash-report": { feature: "reports", module: "report" },
  "stock-history": { feature: "inventory_full", module: "inventory" },
  "stock-reconciliation": { feature: "inventory_full", module: "inventory" },
  profile: {},
  // Header avatar menu only (not in the sidebar) — any logged-in owner.
  "change-password": {},
  "business-settings": { feature: "pos", module: "settings" },
}
