import type { components } from "@/shared/api/generated/owner-schema"

// `addon_option_id` / `addon_option_name` were added after the generated schema
// (the generator can't be re-run — see ARCHITECTURE.md): a recipe line with an
// option only applies when that serving option (e.g. "Ice") is ordered; null =
// applies to every serving.
export type Recipe = components["schemas"]["dto.RecipeResponse"] & {
  addon_option_id?: number | null
  addon_option_name?: string
}
export type CreateRecipePayload = components["schemas"]["dto.CreateRecipeRequest"] & {
  addon_option_id?: number | null
}
export type UpdateRecipePayload = components["schemas"]["dto.UpdateRecipeRequest"]
