import type {
  AddIngredientStockPayload,
  AddMenuStockPayload,
  IngredientStockMovement,
  MenuStockMovement,
  StockMovementDirection,
} from "@/entities/stock-movement/model/stock-movement.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse } from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

export interface StockMovementListResult<T> {
  items: T[]
  total: number
  totalPages: number
  // All stock in / out of the item, across every page (not affected by the
  // direction filter).
  totalIn: number
  totalOut: number
}

// PaginatedResponse plus the summary the movement endpoints add.
type MovementPage<T> = PaginatedResponse<T> & { total_in?: number; total_out?: number }

const EMPTY_RESULT = { items: [], total: 0, totalPages: 0, totalIn: 0, totalOut: 0 }

async function listMovements<T>(
  url: string,
  page: number,
  perPage: number,
  direction?: StockMovementDirection
): Promise<StockMovementListResult<T>> {
  try {
    const response = await apiClient.get<MovementPage<T>>(url, {
      params: { page, per_page: perPage, direction },
    })
    return {
      items: response.data.data,
      total: response.data.total,
      totalPages: response.data.total_pages,
      totalIn: response.data.total_in ?? 0,
      totalOut: response.data.total_out ?? 0,
    }
  } catch (error) {
    console.error("Failed to list stock movements", error)
    return EMPTY_RESULT
  }
}

export function listIngredientStockMovements(
  ingredientId: number,
  page: number,
  perPage: number,
  direction?: StockMovementDirection
): Promise<StockMovementListResult<IngredientStockMovement>> {
  return listMovements(`/master/ingredients/${ingredientId}/stock-movements`, page, perPage, direction)
}

export function listMenuStockMovements(
  menuId: number,
  page: number,
  perPage: number,
  direction?: StockMovementDirection
): Promise<StockMovementListResult<MenuStockMovement>> {
  return listMovements(`/master/menus/${menuId}/stock-movements`, page, perPage, direction)
}

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, friendlyErrorMessage(error))
  return new CrudServiceError("UNKNOWN", friendlyErrorMessage(error))
}

// POST /master/ingredients/{id}/stock-in — goods received. Recorded as
// "Stok masuk" (IN / PURCHASE); a purchase_price also updates the
// ingredient's harga beli.
export async function addIngredientStock(id: number, payload: AddIngredientStockPayload): Promise<void> {
  try {
    await apiClient.post(`/master/ingredients/${id}/stock-in`, payload)
  } catch (error) {
    throw toServiceError(error)
  }
}

// POST /master/menus/{id}/stock-in — same for a menu tracked per item.
export async function addMenuStock(id: number, payload: AddMenuStockPayload): Promise<void> {
  try {
    await apiClient.post(`/master/menus/${id}/stock-in`, payload)
  } catch (error) {
    throw toServiceError(error)
  }
}
