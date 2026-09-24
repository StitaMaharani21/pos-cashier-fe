import type { components } from "@/shared/api/generated/owner-schema"

export type Ingredient = components["schemas"]["dto.IngredientResponse"]
export type CreateIngredientPayload = components["schemas"]["dto.CreateIngredientRequest"]
export type UpdateIngredientPayload = components["schemas"]["dto.UpdateIngredientRequest"]
export type AdjustIngredientStockPayload =
  components["schemas"]["dto.AdjustIngredientStockRequest"]
