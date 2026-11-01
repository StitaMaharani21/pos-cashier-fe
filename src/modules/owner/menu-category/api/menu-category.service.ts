import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import type { MenuCategoryFormPayload } from "@/modules/owner/menu-category/components/MenuCategoryForm"
import { ApiError, apiClient } from "@/shared/api/client"
import {
  CrudServiceError,
  type MasterStatus,
  type PaginatedResponse,
  type SingleResponse,
  type UpdateStatusPayload,
} from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

const RESOURCE = "/master/menu-categories"

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, friendlyErrorMessage(error))
  return new CrudServiceError("UNKNOWN", friendlyErrorMessage(error))
}

// A store has a handful of categories — fetched in one page; search, the
// status filter and paging happen client-side. `menu_count` is only filled
// by this list endpoint.
export async function listMenuCategories(): Promise<MenuCategory[]> {
  const response = await apiClient.get<PaginatedResponse<MenuCategory>>(RESOURCE, {
    params: { page: 1, per_page: 100 },
  })
  return response.data.data
}

// sort_order omitted (0): the backend appends a new category and keeps the
// current position on edit — order is changed with reorderMenuCategories.
export async function saveMenuCategory(id: number | null, payload: MenuCategoryFormPayload): Promise<MenuCategory> {
  try {
    const body = { ...payload, sort_order: 0 }
    const response =
      id == null
        ? await apiClient.post<SingleResponse<MenuCategory>>(RESOURCE, body)
        : await apiClient.put<SingleResponse<MenuCategory>>(`${RESOURCE}/${id}`, body)
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

// Categories are never deleted, only switched off. While a category is
// inactive its menus are hidden from the cashier app (the menus themselves
// aren't changed, so switching it back on restores them).
export async function setMenuCategoryStatus(id: number, status: MasterStatus): Promise<MenuCategory> {
  try {
    const response = await apiClient.patch<SingleResponse<MenuCategory>>(`${RESOURCE}/${id}/status`, {
      status,
    } satisfies UpdateStatusPayload)
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

// `ids` in their new order — may be just the rows on screen; the backend
// rearranges them within the slots they occupy.
export async function reorderMenuCategories(ids: number[]): Promise<void> {
  try {
    await apiClient.put(`${RESOURCE}/reorder`, { ids })
  } catch (error) {
    throw toServiceError(error)
  }
}
