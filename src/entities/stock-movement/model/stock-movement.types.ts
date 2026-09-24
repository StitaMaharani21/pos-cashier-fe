import type { components } from "@/shared/api/generated/owner-schema"

// Long namespaced keys because `StockMovementResponse` collides between the
// ingredient and menu packages — swag/openapi-typescript disambiguates with
// the full Go import path (same pattern as menu.types.ts's AddonGroupResponse).
export type IngredientStockMovement =
  components["schemas"]["github_com_deltathrs_pos-kasir-be_internal_master_ingredient_dto.StockMovementResponse"]
export type MenuStockMovement =
  components["schemas"]["github_com_deltathrs_pos-kasir-be_internal_master_menu_dto.StockMovementResponse"]
