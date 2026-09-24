import type {
  AdjustIngredientStockPayload,
  CreateIngredientPayload,
  Ingredient,
  UpdateIngredientPayload,
} from "@/entities/ingredient/model/ingredient.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudServiceError, type PaginatedResponse, type SingleResponse } from "@/shared/api/crud/types"

const RESOURCE = "/master/ingredients"

// Plain-JSON CRUD (no multipart, no image) — the generic factory handles
// create/update/remove directly.
export const ingredientService = createCrudService<
  Ingredient,
  CreateIngredientPayload,
  UpdateIngredientPayload
>(RESOURCE)

export interface ListIngredientsParams {
  page: number
  perPage: number
  search?: string
}

export interface ListIngredientsResult {
  items: Ingredient[]
  total: number
  totalPages: number
}

// createCrudService.list() discards pagination metadata — hand-written here
// the same way modules/owner/menu/api/menu.service.ts's listMenus() is,
// since /master/ingredients also requires page/per_page and supports search.
export async function listIngredients({
  page,
  perPage,
  search,
}: ListIngredientsParams): Promise<ListIngredientsResult> {
  try {
    const response = await apiClient.get<PaginatedResponse<Ingredient>>(RESOURCE, {
      params: { page, per_page: perPage, search: search || undefined },
    })
    return {
      items: response.data.data,
      total: response.data.total,
      totalPages: response.data.total_pages,
    }
  } catch (error) {
    console.error("Failed to list ingredients", error)
    return { items: [], total: 0, totalPages: 0 }
  }
}

// PATCH /master/ingredients/{id}/stock — the real stock-adjustment endpoint
// (delta can be either sign, keterangan is required): atomically updates
// mtr_ingredient.stok AND logs a trx_stock_movement row server-side. This
// replaces the old client-side read-modify-write workaround against the
// full-overwrite PUT.
export async function adjustIngredientStock(
  id: number,
  payload: AdjustIngredientStockPayload
): Promise<Ingredient> {
  try {
    const response = await apiClient.patch<SingleResponse<Ingredient>>(
      `${RESOURCE}/${id}/stock`,
      payload
    )
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw new CrudServiceError(error.code, error.message)
    }
    throw new CrudServiceError(
      "UNKNOWN",
      error instanceof Error ? error.message : "Unexpected error"
    )
  }
}
