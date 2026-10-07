import type {
  AddonGroup,
  AddonOption,
  AddonStatus,
  CreateAddonGroupRequest,
  UpdateAddonGroupRequest,
} from "@/entities/menu-addon/model/menu-addon.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { ApiError, apiClient } from "@/shared/api/client"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudServiceError, type CrudService, type PaginatedResponse, type SingleResponse } from "@/shared/api/crud/types"

const RESOURCE = "/master/addon-groups"

export const ADDON_GROUPS_KEY = "addon-groups"

export interface AddonOptionDraft {
  // Absent for an option added in this edit.
  id?: number
  name: string
  price: number
  status: AddonStatus
}

// What the form submits. The backend splits a group over several endpoints
// (group, its options, its menus), so the same payload drives all of them.
export interface AddonGroupDraft {
  name: string
  is_required: boolean
  max_select: number
  status: AddonStatus
  // In display order.
  options: AddonOptionDraft[]
  menu_ids: number[]
  // The group as it was when the form opened (edit only) — what the options
  // and menus above are diffed against.
  original?: AddonGroup
}

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, error.message)
  return new CrudServiceError("UNKNOWN", error instanceof Error ? error.message : "Unexpected error")
}

// Plain JSON list/delete come from the generic factory; create and update
// fan out to the option and menu endpoints, so they're written out below.
const base = createCrudService<AddonGroup, AddonGroupDraft, AddonGroupDraft>(RESOURCE)

async function nextSortOrder(): Promise<number> {
  try {
    const response = await apiClient.get<PaginatedResponse<AddonGroup>>(RESOURCE, {
      params: { page: 1, per_page: 1 },
    })
    return (response.data.total ?? 0) + 1
  } catch {
    return 0
  }
}

// attach/detach one at a time failing shouldn't hide that the group itself
// was saved — report how many menus didn't make it.
async function syncMenus(groupId: number, wanted: number[], current: number[]): Promise<void> {
  const toAttach = wanted.filter((id) => !current.includes(id))
  const toDetach = current.filter((id) => !wanted.includes(id))

  const results = await Promise.allSettled([
    ...toAttach.map((menuId) => apiClient.post(`${RESOURCE}/${groupId}/menus`, { menu_id: menuId })),
    ...toDetach.map((menuId) => apiClient.delete(`${RESOURCE}/${groupId}/menus/${menuId}`)),
  ])
  const failed = results.filter((result) => result.status === "rejected").length
  if (failed > 0) {
    throw new CrudServiceError(
      "MENU_SYNC_FAILED",
      `Grup tersimpan, tetapi ${failed} menu gagal diperbarui. Buka lagi grupnya dan coba simpan ulang.`
    )
  }
}

async function create(draft: AddonGroupDraft): Promise<AddonGroup> {
  const body: CreateAddonGroupRequest = {
    name: draft.name,
    is_required: draft.is_required,
    max_select: draft.max_select,
    sort_order: await nextSortOrder(),
    status: draft.status,
    options: draft.options.map((option, index) => ({
      name: option.name,
      price: option.price,
      sort_order: index,
      status: option.status,
    })),
  }

  let group: AddonGroup
  try {
    const response = await apiClient.post<SingleResponse<AddonGroup>>(RESOURCE, body)
    group = response.data.data
  } catch (error) {
    throw toServiceError(error)
  }

  await syncMenus(group.id, draft.menu_ids, [])
  return group
}

async function update(id: number | string, draft: AddonGroupDraft): Promise<AddonGroup> {
  const original = draft.original
  const groupId = Number(id)

  try {
    const body: UpdateAddonGroupRequest = {
      name: draft.name,
      is_required: draft.is_required,
      max_select: draft.max_select,
      sort_order: original?.sort_order ?? 0,
      status: draft.status,
    }
    const response = await apiClient.put<SingleResponse<AddonGroup>>(`${RESOURCE}/${groupId}`, body)
    const group = response.data.data

    // Options: drop the removed ones first, then update/add in display order.
    const keptIds = new Set(draft.options.flatMap((option) => (option.id ? [option.id] : [])))
    for (const option of original?.options ?? []) {
      if (!keptIds.has(option.id)) {
        await apiClient.delete(`${RESOURCE}/${groupId}/options/${option.id}`)
      }
    }
    for (const [index, option] of draft.options.entries()) {
      const optionBody = { name: option.name, price: option.price, sort_order: index, status: option.status }
      if (option.id) {
        await apiClient.put<SingleResponse<AddonOption>>(`${RESOURCE}/${groupId}/options/${option.id}`, optionBody)
      } else {
        await apiClient.post<SingleResponse<AddonOption>>(`${RESOURCE}/${groupId}/options`, optionBody)
      }
    }

    await syncMenus(groupId, draft.menu_ids, original?.menu_ids ?? [])
    return group
  } catch (error) {
    throw error instanceof CrudServiceError ? error : toServiceError(error)
  }
}

export const menuAddonService: CrudService<AddonGroup, AddonGroupDraft, AddonGroupDraft> = {
  ...base,
  create,
  update,
}

// Every menu, for the "Berlaku untuk menu" picker — the list endpoint is
// paginated, a store's whole menu is a handful of pages at most.
export const ADDON_MENU_PICKER_KEY = ["addon-group-menu-picker"] as const

export async function listAllMenus(): Promise<Menu[]> {
  const perPage = 100
  const first = await listMenus({ page: 1, perPage })
  const menus = [...first.items]
  for (let page = 2; page <= first.totalPages; page += 1) {
    menus.push(...(await listMenus({ page, perPage })).items)
  }
  return menus
}
