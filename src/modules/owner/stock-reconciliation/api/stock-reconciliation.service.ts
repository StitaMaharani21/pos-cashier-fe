import type {
  IngredientStockReconciliationItem,
  MenuStockReconciliationItem,
} from "@/entities/stock-reconciliation/model/stock-reconciliation.types"
import { apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"

// Wrapped in the usual {message, data} envelope (response.Success on the
// backend, not a raw array despite the swagger annotation's `{array}` —
// verified against ingredient_handler.go/menu_handler.go's
// GetStockReconciliation, both call response.Success(c, ..., res) where res
// is the array). No pagination — these are drift reports, meant to
// normally come back empty. Degrade to [] on failure like every other list
// fetcher in this app, rather than surfacing a hard error for what's meant
// to be a quiet background check.
export async function getIngredientReconciliation(): Promise<
  IngredientStockReconciliationItem[]
> {
  try {
    const response = await apiClient.get<SingleResponse<IngredientStockReconciliationItem[]>>(
      "/master/ingredients/stock-reconciliation"
    )
    return response.data.data
  } catch (error) {
    console.error("Failed to get ingredient stock reconciliation", error)
    return []
  }
}

export async function getMenuReconciliation(): Promise<MenuStockReconciliationItem[]> {
  try {
    const response = await apiClient.get<SingleResponse<MenuStockReconciliationItem[]>>(
      "/master/menus/stock-reconciliation"
    )
    return response.data.data
  } catch (error) {
    console.error("Failed to get menu stock reconciliation", error)
    return []
  }
}
