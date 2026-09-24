import type { CreateRecipePayload, Recipe, UpdateRecipePayload } from "@/entities/recipe/model/recipe.types"
import { createCrudService } from "@/shared/api/crud/createCrudService"

// Plain JSON CRUD. Always called with a `menu_id` filter — a menu's BOM is
// short, so no custom paginated fetcher is needed (unlike ingredients).
export const recipeService = createCrudService<Recipe, CreateRecipePayload, UpdateRecipePayload>(
  "/master/recipes"
)
