import type {
  CreateIngredientPayload,
  Ingredient,
  UpdateIngredientPayload,
} from "@/entities/ingredient/model/ingredient.types"
import { apiClient } from "@/shared/api/client"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import type { PaginatedResponse } from "@/shared/api/crud/types"

const RESOURCE = "/master/ingredients"

// Plain-JSON CRUD (no multipart, no image) — the generic factory handles
// create/update/setStatus directly (ingredients are never deleted).
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
