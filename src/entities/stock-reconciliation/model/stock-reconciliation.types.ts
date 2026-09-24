import type { components } from "@/shared/api/generated/owner-schema"

// Long namespaced keys — same collision/disambiguation reasoning as
// entities/stock-movement/model/stock-movement.types.ts.
export type IngredientStockReconciliationItem =
  components["schemas"]["github_com_deltathrs_pos-kasir-be_internal_master_ingredient_dto.StockReconciliationItem"]
export type MenuStockReconciliationItem =
  components["schemas"]["github_com_deltathrs_pos-kasir-be_internal_master_menu_dto.StockReconciliationItem"]
