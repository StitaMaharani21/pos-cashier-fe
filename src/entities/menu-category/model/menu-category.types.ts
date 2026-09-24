import type { components } from "@/shared/api/generated/owner-schema"

export type MenuCategory = components["schemas"]["dto.MenuCategoryResponse"]
export type CreateMenuCategoryPayload =
  components["schemas"]["dto.CreateMenuCategoryRequest"]
export type UpdateMenuCategoryPayload =
  components["schemas"]["dto.UpdateMenuCategoryRequest"]
