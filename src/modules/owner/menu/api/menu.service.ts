import type {
  CreateMenuPayload,
  Menu,
  MenuStock,
  UpdateMenuPayload,
  UpsertMenuStockPayload,
} from "@/entities/menu/model/menu.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse, type SingleResponse } from "@/shared/api/crud/types"

// Hand-written, not `createCrudService` — POST/PUT are multipart/form-data
// (image upload), and the list needs pagination + search + category filter
// params the generic factory doesn't model. See the feature README.
const RESOURCE = "/master/menus"

// openapi-typescript renders the generated `image` field as `string`
// (format: binary) — correct for the wire format, useless for a browser
// File input. Override just that field with the real runtime type. `stock_qty`
// isn't part of the multipart body at all — it's set via a separate
// `PUT /master/menus/:id/stock` call, sequenced below (`by_menu` mode only).
export type CreateMenuFormPayload = Omit<CreateMenuPayload, "image"> & {
  image: File
  stock_qty?: number
}
export type UpdateMenuFormPayload = Omit<UpdateMenuPayload, "image"> & {
  image?: File | null
  stock_qty?: number
}

export interface ListMenusParams {
  page: number
  perPage: number
  search?: string
  categoryId?: number
}

export interface ListMenusResult {
  items: Menu[]
  total: number
  totalPages: number
}

function toFormData(payload: CreateMenuFormPayload | UpdateMenuFormPayload): FormData {
  const formData = new FormData()
  formData.append("category_id", String(payload.category_id))
  formData.append("code", payload.code)
  formData.append("name", payload.name)
  if (payload.description) formData.append("description", payload.description)
  formData.append("price", String(payload.price))
  if (payload.preparation_time != null) {
    formData.append("preparation_time", String(payload.preparation_time))
  }
  formData.append("is_available", String(payload.is_available ?? false))
  formData.append("is_featured", String(payload.is_featured ?? false))
  formData.append("stock_deduction_method", payload.stock_deduction_method ?? "none")
  if (payload.image) formData.append("image", payload.image)
  return formData
}

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, error.message)
  return new CrudServiceError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unexpected error"
  )
}

export async function listMenus({
  page,
  perPage,
  search,
  categoryId,
}: ListMenusParams): Promise<ListMenusResult> {
  try {
    const response = await apiClient.get<PaginatedResponse<Menu>>(RESOURCE, {
      params: {
        page,
        per_page: perPage,
        search: search || undefined,
        category_id: categoryId || undefined,
      },
    })
    return {
      items: response.data.data,
      total: response.data.total,
      totalPages: response.data.total_pages,
    }
  } catch (error) {
    console.error("Failed to list menus", error)
    return { items: [], total: 0, totalPages: 0 }
  }
}

// stock_qty lives on a separate endpoint (`dto.UpsertStockRequest` only has
// this one field — no low_stock_threshold, which the backend doesn't expose
// for editing at all).
export async function upsertMenuStock(menuId: number, stockQty: number): Promise<MenuStock> {
  try {
    const response = await apiClient.put<SingleResponse<MenuStock>>(`${RESOURCE}/${menuId}/stock`, {
      stock_qty: stockQty,
    } satisfies UpsertMenuStockPayload)
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function createMenu(payload: CreateMenuFormPayload): Promise<Menu> {
  try {
    const response = await apiClient.post<SingleResponse<Menu>>(RESOURCE, toFormData(payload))
    let menu = response.data.data
    if (payload.stock_deduction_method === "by_menu" && payload.stock_qty != null && menu.id != null) {
      await upsertMenuStock(menu.id, payload.stock_qty)
      menu = { ...menu, stock_qty: payload.stock_qty }
    }
    return menu
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
    let menu = response.data.data
    if (payload.stock_deduction_method === "by_menu" && payload.stock_qty != null) {
      await upsertMenuStock(id, payload.stock_qty)
      menu = { ...menu, stock_qty: payload.stock_qty }
    }
    return menu
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function deleteMenu(id: number): Promise<void> {
  try {
    await apiClient.delete(`${RESOURCE}/${id}`)
  } catch (error) {
    throw toServiceError(error)
  }
}
