import type { MasterStatus } from "@/shared/api/crud/types"
import type { components, paths } from "@/shared/api/generated/owner-schema"

export type Menu = components["schemas"]["dto.MenuResponse"] & {
  // Added after the generated schema (the generator can't be re-run — see
  // ARCHITECTURE.md). `status` is the menu's own switch; `effective_active` is
  // false as well when its category is inactive (`inactive_reason` says why).
  // Inactive menus are hidden from the cashier app and self-order, unlike
  // `is_available`, which only marks a menu sold out.
  status?: MasterStatus
  effective_active?: boolean
  inactive_reason?: "self" | "category"
  // Harga pokok per porsi typed in by the owner (menus without a recipe). Owner
  // only; the cashier never receives it.
  cost_price?: number
}
export type MenuStock = components["schemas"]["dto.MenuStockResponse"]
export type MenuDiscount = components["schemas"]["dto.MenuDiscountResponse"]
// Owner dashboard "Stok Hampir Habis" widget (Pro plan only).
export type LowStockMenu = components["schemas"]["dto.LowStockResponse"]

// Create/update are multipart/form-data (image upload), not a
// components.schemas entry — pulled from the path's requestBody instead.
export type CreateMenuPayload =
  paths["/master/menus"]["post"]["requestBody"]["content"]["multipart/form-data"]
export type UpdateMenuPayload =
  paths["/master/menus/{id}"]["put"]["requestBody"]["content"]["multipart/form-data"]

export type UpdateMenuAvailabilityPayload =
  components["schemas"]["dto.UpdateAvailabilityRequest"]
export type UpsertMenuStockPayload = components["schemas"]["dto.UpsertStockRequest"]

// Mirrors the backend's Menu.StockDeductionMethod validation
// (internal/master/menu/menu_service.go) — plain string on the wire, no
// generated enum, so this is asserted client-side.
export type StockDeductionMethod = "none" | "by_ingredient" | "by_menu"
