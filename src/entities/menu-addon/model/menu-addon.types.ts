// pos-kasir-be's internal/master/menu_addon (GET/POST /master/addon-groups,
// …/:id/options, …/:id/menus). Written by hand rather than generated: the
// generator's allow-list leaves this endpoint out, and regenerating the
// owner schema would rename shared dto types other screens depend on.

export type AddonStatus = "active" | "inactive"

export interface AddonOption {
  id: number
  addon_group_id: number
  name: string
  // Extra charge in rupiah, added to the menu price when picked (0 = free).
  price: number
  sort_order: number
  status: AddonStatus
}

// A set of choices a customer picks from on a menu, e.g. "Tambahan" with
// "Gula +Rp5.000" and "Es Batu +Rp0". One group can be attached to many menus.
export interface AddonGroup {
  id: number
  name: string
  // The customer has to pick at least one option before ordering.
  is_required: boolean
  // 1 = pick one (radio); 0 = no limit; n = up to n options.
  max_select: number
  sort_order: number
  status: AddonStatus
  options: AddonOption[]
  // Menus the group is attached to. Absent on responses from a backend older
  // than the menu_ids field.
  menu_ids?: number[]
}

export interface AddonOptionInput {
  name: string
  price: number
  sort_order: number
  status: AddonStatus
}

export interface CreateAddonGroupRequest {
  name: string
  is_required: boolean
  max_select: number
  sort_order: number
  status: AddonStatus
  options: AddonOptionInput[]
}

export type UpdateAddonGroupRequest = Omit<CreateAddonGroupRequest, "options">
