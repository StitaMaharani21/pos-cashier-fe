import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { CreateRecipePayload, Recipe, UpdateRecipePayload } from "@/entities/recipe/model/recipe.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudServiceError, type PaginatedResponse } from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

const RESOURCE = "/master/recipes"

// Plain JSON CRUD. Always called with a `menu_id` filter — a menu's BOM is
// short, so no custom paginated fetcher is needed (unlike ingredients).
const base = createCrudService<Recipe, CreateRecipePayload, UpdateRecipePayload>(RESOURCE)

// Unlike `recipeService.list` (which hides failures behind an empty list) this
// throws, so the recipe block can tell "no recipe yet" from "couldn't load it"
// — e.g. a 402 when the store's plan has no Inventori.
export async function listMenuRecipes(menuId: number): Promise<Recipe[]> {
  const response = await apiClient.get<PaginatedResponse<Recipe>>(RESOURCE, {
    params: { menu_id: menuId, page: 1, per_page: 100 },
  })
  return response.data.data
}

// Every ingredient for the recipe picker, all pages (a store can have more
// than one page of 100). Throws on failure, same reason as above.
export async function listAllIngredients(): Promise<Ingredient[]> {
  const perPage = 100
  const first = await apiClient.get<PaginatedResponse<Ingredient>>("/master/ingredients", {
    params: { page: 1, per_page: perPage },
  })
  const ingredients = [...first.data.data]
  for (let page = 2; page <= first.data.total_pages; page += 1) {
    const next = await apiClient.get<PaginatedResponse<Ingredient>>("/master/ingredients", {
      params: { page, per_page: perPage },
    })
    ingredients.push(...next.data.data)
  }
  return ingredients
}

// A recipe line is part of a menu's composition, not master data: taking an
// ingredient out of a recipe is still a real DELETE (nothing references it).
export const recipeService = {
  ...base,
  async remove(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`${RESOURCE}/${id}`)
    } catch (error) {
      throw new CrudServiceError(
        error instanceof ApiError ? error.code : "UNKNOWN",
        friendlyErrorMessage(error)
      )
    }
  },
}
