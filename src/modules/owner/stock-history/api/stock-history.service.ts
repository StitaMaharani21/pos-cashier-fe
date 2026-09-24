import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import type {
  IngredientStockMovement,
  MenuStockMovement,
} from "@/entities/stock-movement/model/stock-movement.types"
import { apiClient } from "@/shared/api/client"
import type { PaginatedResponse } from "@/shared/api/crud/types"

export interface StockMovementListResult<T> {
  items: T[]
  total: number
  totalPages: number
}

export async function listIngredientStockMovements(
  ingredientId: number,
  page: number,
  perPage: number
): Promise<StockMovementListResult<IngredientStockMovement>> {
  try {
    const response = await apiClient.get<PaginatedResponse<IngredientStockMovement>>(
      `/master/ingredients/${ingredientId}/stock-movements`,
      { params: { page, per_page: perPage } }
    )
    return {
      items: response.data.data,
      total: response.data.total,
      totalPages: response.data.total_pages,
    }
  } catch (error) {
    console.error("Failed to list ingredient stock movements", error)
    return { items: [], total: 0, totalPages: 0 }
  }
}

export async function listMenuStockMovements(
  menuId: number,
  page: number,
  perPage: number
): Promise<StockMovementListResult<MenuStockMovement>> {
  try {
    const response = await apiClient.get<PaginatedResponse<MenuStockMovement>>(
      `/master/menus/${menuId}/stock-movements`,
      { params: { page, per_page: perPage } }
    )
    return {
      items: response.data.data,
      total: response.data.total,
      totalPages: response.data.total_pages,
    }
  } catch (error) {
    console.error("Failed to list menu stock movements", error)
    return { items: [], total: 0, totalPages: 0 }
  }
}

// Self-contained "fetch everything for a picker" fetches, mirroring
// RecipeManager.tsx's listAllIngredients()/ProductDiscountForm.tsx's
// listAllMenus() idiom rather than importing those modules' own paginated
// services.
export async function listAllIngredientsForPicker(): Promise<Ingredient[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Ingredient>>("/master/ingredients", {
      params: { page: 1, per_page: 100 },
    })
    return response.data.data
  } catch (error) {
    console.error("Failed to list ingredients for stock-history picker", error)
    return []
  }
}

export async function listAllMenusForPicker(): Promise<Menu[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Menu>>("/master/menus", {
      params: { page: 1, per_page: 100 },
    })
    return response.data.data
  } catch (error) {
    console.error("Failed to list menus for stock-history picker", error)
    return []
  }
}
