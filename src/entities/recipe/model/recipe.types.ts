import type { components } from "@/shared/api/generated/owner-schema"

export type Recipe = components["schemas"]["dto.RecipeResponse"]
export type CreateRecipePayload = components["schemas"]["dto.CreateRecipeRequest"]
export type UpdateRecipePayload = components["schemas"]["dto.UpdateRecipeRequest"]
