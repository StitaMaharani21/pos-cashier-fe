import type { components } from "@/shared/api/generated/owner-schema"

// Long namespaced keys because `StockMovementResponse` collides between the
// ingredient and menu packages — swag/openapi-typescript disambiguates with
// the full Go import path (same pattern as menu.types.ts's AddonGroupResponse).
//
// `delta` is the signed change (stock_after − stock_before: positive = stock
// in, negative = stock out); `qty` is always positive. The generated schema
// predates it, so it is declared here until the types are regenerated.
export type IngredientStockMovement =
  components["schemas"]["github_com_deltathrs_pos-kasir-be_internal_master_ingredient_dto.StockMovementResponse"] & {
    delta?: number
  }
export type MenuStockMovement =
  components["schemas"]["github_com_deltathrs_pos-kasir-be_internal_master_menu_dto.StockMovementResponse"] & {
    delta?: number
  }

// "in" = only stock in, "out" = only stock out; omitted = both.
export type StockMovementDirection = "in" | "out"

// POST /master/ingredients/{id}/stock-in and POST /master/menus/{id}/stock-in
// (type IN / reference PURCHASE). Not in the generated schema yet.
export interface AddIngredientStockPayload {
  qty: number
  purchase_price?: number
  keterangan?: string
}

export interface AddMenuStockPayload {
  qty: number
  keterangan?: string
}
