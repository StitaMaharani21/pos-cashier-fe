import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import type { GuestMenu } from "@/modules/public/self-order/domain/self-order.types"
import { listMenus } from "@/modules/public/self-order/infrastructure/self-order.api"

export interface MenuCategory {
  id: number
  name: string
}

export function useGuestMenu(storeCode: string) {
  const query = useQuery({
    queryKey: ["guest-menus", storeCode],
    queryFn: () => listMenus(storeCode),
    staleTime: 60_000,
    retry: false,
  })

  // There is no public category endpoint: categories are whatever the menus
  // carry, in the order they first appear.
  const categories = useMemo<MenuCategory[]>(() => {
    const seen = new Map<number, string>()
    for (const menu of query.data ?? []) {
      if (!seen.has(menu.category_id)) seen.set(menu.category_id, menu.category_name || "Lainnya")
    }
    return [...seen].map(([id, name]) => ({ id, name }))
  }, [query.data])

  return { ...query, menus: query.data ?? ([] as GuestMenu[]), categories }
}
