import type { CreateMenuPayload, Menu, UpdateMenuPayload } from "@/entities/menu/model/menu.types"
import { ApiError, apiClient } from "@/shared/api/client"
import {
  CrudServiceError,
  type MasterStatus,
  type PaginatedResponse,
  type SingleResponse,
  type UpdateStatusPayload,
} from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

// Hand-written, not `createCrudService` — POST/PUT are multipart/form-data
// (image upload), and the list needs pagination + search + category filter
// params the generic factory doesn't model. See the feature README.
const RESOURCE = "/master/menus"

// openapi-typescript renders the generated `image` field as `string`
// (format: binary) — correct for the wire format, useless for a browser
// File input. Override just that field with the real runtime type.
//
// There is no stock on create or update: a menu's stock starts at 0 and is only
// ever changed from Riwayat Stok (Ubah Stok). The form used to resend the stock
// it had loaded, which overwrote sales made since and wrote a bogus adjustment
// when only the price changed. `cost_price` (harga pokok per porsi, for a menu
// without a recipe) is added after the generated schema; omitted = unchanged.
export type CreateMenuFormPayload = Omit<CreateMenuPayload, "image"> & {
  image: File
  cost_price?: number
}
export type UpdateMenuFormPayload = Omit<UpdateMenuPayload, "image"> & {
  image?: File | null
  cost_price?: number
}

export interface ListMenusParams {
  page: number
  perPage: number
  search?: string
  categoryId?: number
  // The "Status" filter: Tersedia (true) / Tidak tersedia (false).
  available?: boolean
  // Only menus using this stock method (the stock-history list wants "by_menu").
  stockDeductionMethod?: "none" | "by_ingredient" | "by_menu"
}

export interface ListMenusResult {
  items: Menu[]
  total: number
  totalPages: number
}

function toFormData(payload: CreateMenuFormPayload | UpdateMenuFormPayload): FormData {
  const formData = new FormData()
  formData.append("category_id", String(payload.category_id))
  // Empty on create → the backend generates MNU-001, MNU-002, ...
  if (payload.code) formData.append("code", payload.code)
  formData.append("name", payload.name)
  if (payload.description) formData.append("description", payload.description)
  formData.append("price", String(payload.price))
  if (payload.preparation_time != null) {
    formData.append("preparation_time", String(payload.preparation_time))
  }
  formData.append("is_available", String(payload.is_available ?? false))
  formData.append("is_featured", String(payload.is_featured ?? false))
  formData.append("stock_deduction_method", payload.stock_deduction_method ?? "none")
  if (payload.cost_price != null) formData.append("cost_price", String(payload.cost_price))
  if (payload.image) formData.append("image", payload.image)
  return formData
}

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, friendlyErrorMessage(error))
  return new CrudServiceError(
    "UNKNOWN",
    friendlyErrorMessage(error)
  )
}

// Throws on failure (the section shows an error state) — listed in the
// backend's `urutan` order, the same order the cashier app uses.
export async function listMenus({
  page,
  perPage,
  search,
  categoryId,
  available,
  stockDeductionMethod,
}: ListMenusParams): Promise<ListMenusResult> {
  const response = await apiClient.get<PaginatedResponse<Menu>>(RESOURCE, {
    params: {
      page,
      per_page: perPage,
      search: search || undefined,
      category_id: categoryId || undefined,
      available,
      stock_deduction_method: stockDeductionMethod,
    },
  })
  return {
    items: response.data.data,
    total: response.data.total,
    totalPages: response.data.total_pages,
  }
}

// `ids` in their new order — may be just the page on screen; the backend
// rearranges them within the slots they occupy (PUT /master/menus/reorder).
export async function reorderMenus(ids: number[]): Promise<void> {
  try {
    await apiClient.put(`${RESOURCE}/reorder`, { ids })
  } catch (error) {
    throw toServiceError(error)
  }
}

// Single-column update — doesn't touch anything else on the menu.
export async function setMenuAvailability(id: number, isAvailable: boolean): Promise<void> {
  try {
    await apiClient.patch(`${RESOURCE}/${id}/availability`, { is_available: isAvailable })
  } catch (error) {
    throw toServiceError(error)
  }
}

// The star in the list. There's no dedicated endpoint, so this resends the
// row's own fields through the regular PUT (no image = keep the current
// one; no cost_price = unchanged) with is_featured flipped.
export async function setMenuFeatured(menu: Menu, isFeatured: boolean): Promise<Menu> {
  return updateMenu(menu.id ?? 0, {
    category_id: menu.category_id ?? 0,
    code: menu.code ?? "",
    name: menu.name ?? "",
    description: menu.description ?? "",
    price: menu.price ?? 0,
    preparation_time: menu.preparation_time,
    is_available: menu.is_available ?? false,
    is_featured: isFeatured,
    stock_deduction_method: menu.stock_deduction_method ?? "none",
  } as UpdateMenuFormPayload)
}

export async function createMenu(payload: CreateMenuFormPayload): Promise<Menu> {
  try {
    const response = await apiClient.post<SingleResponse<Menu>>(RESOURCE, toFormData(payload))
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updateMenu(id: number, payload: UpdateMenuFormPayload): Promise<Menu> {
  try {
    const response = await apiClient.put<SingleResponse<Menu>>(
      `${RESOURCE}/${id}`,
      toFormData(payload)
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

// Menus are never deleted, only switched off. Unlike is_available ("sold out",
// still shown greyed out in the cashier app) an inactive menu is hidden there.
export async function setMenuStatus(id: number, status: MasterStatus): Promise<Menu> {
  try {
    const response = await apiClient.patch<SingleResponse<Menu>>(`${RESOURCE}/${id}/status`, {
      status,
    } satisfies UpdateStatusPayload)
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}
