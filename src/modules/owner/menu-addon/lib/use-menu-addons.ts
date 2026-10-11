import { useCallback, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { AddonGroup } from "@/entities/menu-addon/model/menu-addon.types"
import {
  ADDON_GROUPS_KEY,
  ADDON_LIST_PARAMS,
  commitMenuAddons,
  hasMenuAddonChanges,
  menuAddonService,
  type AddonGroupDraft,
  type MenuAddonChanges,
} from "@/modules/owner/menu-addon/api/menu-addon.service"

// One group as the menu form shows it.
export interface MenuAddonEntry {
  // Stable across edits: "g<id>" for a saved group, "n<n>" for one created in
  // this form.
  key: string
  // Current values (with the form's edits applied).
  group: AddonGroup
  isNew: boolean
  // Other menus that use the group — editing it changes them too.
  otherMenus: number
}

interface NewGroup {
  key: string
  group: AddonGroup
}

function draftToGroup(draft: AddonGroupDraft, base?: AddonGroup): AddonGroup {
  return {
    id: base?.id ?? 0,
    name: draft.name,
    is_required: draft.is_required,
    max_select: draft.max_select,
    sort_order: base?.sort_order ?? 0,
    status: draft.status,
    // id 0 = an option added in this form (the service posts those).
    options: draft.options.map((option, index) => ({
      id: option.id ?? 0,
      addon_group_id: base?.id ?? 0,
      name: option.name,
      price: option.price,
      sort_order: index,
      status: option.status,
    })),
    menu_ids: base?.menu_ids,
  }
}

function groupToDraft(group: AddonGroup, original?: AddonGroup): AddonGroupDraft {
  return {
    name: group.name,
    is_required: group.is_required,
    max_select: group.max_select,
    status: group.status,
    options: group.options.map((option) => ({
      id: option.id || undefined,
      name: option.name,
      price: option.price,
      status: option.status,
    })),
    menu_ids: [],
    original,
  }
}

// The addon groups on one menu, edited from the menu's own form. Nothing is
// sent while the owner works: the edits are kept here and `commit` applies
// them once the menu is saved (a new menu has no id before that).
export function useMenuAddons(menuId: number | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [ADDON_GROUPS_KEY, ADDON_LIST_PARAMS],
    queryFn: () => menuAddonService.list(ADDON_LIST_PARAMS),
    staleTime: 30_000,
  })

  // Existing groups picked / detached, edited, and groups created in this form.
  const [added, setAdded] = useState<number[]>([])
  const [removed, setRemoved] = useState<number[]>([])
  const [edited, setEdited] = useState<Record<number, AddonGroup>>({})
  const [created, setCreated] = useState<NewGroup[]>([])
  const [counter, setCounter] = useState(0)

  const groups = useMemo(() => query.data ?? [], [query.data])
  const isAttachedOnServer = useCallback(
    (group: AddonGroup) => menuId != null && (group.menu_ids ?? []).includes(menuId),
    [menuId]
  )

  const entries = useMemo<MenuAddonEntry[]>(() => {
    const saved = groups
      .filter((group) => (isAttachedOnServer(group) && !removed.includes(group.id)) || added.includes(group.id))
      .map((group) => ({
        key: `g${group.id}`,
        group: edited[group.id] ?? group,
        isNew: false,
        otherMenus: (group.menu_ids ?? []).filter((id) => id !== menuId).length,
      }))
    const fresh = created.map(({ key, group }) => ({ key, group, isNew: true, otherMenus: 0 }))
    return [...saved, ...fresh]
  }, [groups, added, removed, edited, created, menuId, isAttachedOnServer])

  const available = useMemo(() => {
    const attached = new Set(entries.map((entry) => entry.key))
    return groups.filter((group) => !attached.has(`g${group.id}`))
  }, [groups, entries])

  const addExisting = useCallback(
    (group: AddonGroup) => {
      if (isAttachedOnServer(group)) setRemoved((ids) => ids.filter((id) => id !== group.id))
      else setAdded((ids) => (ids.includes(group.id) ? ids : [...ids, group.id]))
    },
    [isAttachedOnServer]
  )

  const remove = useCallback(
    (entry: MenuAddonEntry) => {
      if (entry.isNew) {
        setCreated((list) => list.filter((item) => item.key !== entry.key))
        return
      }
      const id = entry.group.id
      const server = groups.find((group) => group.id === id)
      setEdited(({ [id]: _dropped, ...rest }) => rest)
      if (server && isAttachedOnServer(server)) setRemoved((ids) => (ids.includes(id) ? ids : [...ids, id]))
      else setAdded((ids) => ids.filter((existing) => existing !== id))
    },
    [groups, isAttachedOnServer]
  )

  // `entry` null = a group created in the form.
  const saveGroup = useCallback(
    (entry: MenuAddonEntry | null, draft: AddonGroupDraft) => {
      if (!entry) {
        const key = `n${counter}`
        setCounter((value) => value + 1)
        setCreated((list) => [...list, { key, group: draftToGroup(draft) }])
      } else if (entry.isNew) {
        setCreated((list) =>
          list.map((item) => (item.key === entry.key ? { ...item, group: draftToGroup(draft) } : item))
        )
      } else {
        setEdited((map) => ({ ...map, [entry.group.id]: draftToGroup(draft, entry.group) }))
      }
    },
    [counter]
  )

  const changes = useMemo<MenuAddonChanges>(() => {
    const editedIds = Object.keys(edited).map(Number)
    return {
      created: created.map((item) => groupToDraft(item.group)),
      edited: editedIds.flatMap((groupId) => {
        const original = groups.find((group) => group.id === groupId)
        return original ? [{ groupId, draft: groupToDraft(edited[groupId], original) }] : []
      }),
      attach: added.filter((id) => !editedIds.includes(id)),
      detach: removed,
    }
  }, [created, edited, added, removed, groups])

  const hasChanges = hasMenuAddonChanges(changes)

  // Undefined when nothing changed, so a menu saved without touching its
  // addons makes no addon requests at all.
  const commit = useMemo(
    () =>
      hasChanges
        ? async (id: number) => {
            try {
              await commitMenuAddons(id, changes)
            } finally {
              await queryClient.invalidateQueries({ queryKey: [ADDON_GROUPS_KEY] })
            }
          }
        : undefined,
    [hasChanges, changes, queryClient]
  )

  return {
    entries,
    available,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    addExisting,
    remove,
    saveGroup,
    commit,
  }
}
