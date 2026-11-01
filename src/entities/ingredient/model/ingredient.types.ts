import type { MasterStatus } from "@/shared/api/crud/types"
import type { components } from "@/shared/api/generated/owner-schema"

// `status` was added after the generated schema. An inactive ingredient is no
// longer offered for recipes or new stock; menus already using it stay active.
export type Ingredient = components["schemas"]["dto.IngredientResponse"] & {
  status?: MasterStatus
  // Weighted-average cost per unit (the HPP basis), recalculated on every
  // "Stok Masuk" with a price. Owner only; the cashier never receives it.
  average_cost?: number
}
export type CreateIngredientPayload = components["schemas"]["dto.CreateIngredientRequest"]
export type UpdateIngredientPayload = components["schemas"]["dto.UpdateIngredientRequest"]
export type AdjustIngredientStockPayload =
  components["schemas"]["dto.AdjustIngredientStockRequest"]
