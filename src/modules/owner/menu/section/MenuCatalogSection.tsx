import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { MENUS_KEY } from "@/modules/owner/menu/constants/menu-display"
import { ADDON_GROUPS_KEY, ADDON_LIST_PARAMS, menuAddonService } from "@/modules/owner/menu-addon/api/menu-addon.service"
import { MenuAddonSection } from "@/modules/owner/menu-addon/section/MenuAddonSection"
import { MenuSection } from "@/modules/owner/menu/section/MenuSection"
import { listMenuCategories } from "@/modules/owner/menu-category/api/menu-category.service"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { MenuCategorySection } from "@/modules/owner/menu-category/section/MenuCategorySection"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"

type Tab = "kategori" | "menu" | "tambahan"

// /app/menu — one sidebar entry ("Menu") for the master-data screens of a
// product, as tabs: ?tab=kategori (default) | ?tab=menu | ?tab=tambahan. A
// menu's addon groups are managed from the menu form; the Tambahan tab lists
// all groups. The old /app/menu-category and /app/menu-addon URLs redirect
// here (see AppRouter).
export function MenuCatalogSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tab: Tab = tabParam === "menu" || tabParam === "tambahan" ? tabParam : "kategori"

  // Tab badges: the categories list is shared with the Kategori tab's query;
  // the menu total comes from a 1-row page.
  const { data: categories } = useQuery({ queryKey: MENU_CATEGORIES_KEY, queryFn: listMenuCategories })
  const { data: menuTotal } = useQuery({
    queryKey: [...MENUS_KEY, "total"],
    queryFn: () => listMenus({ page: 1, perPage: 1 }).then((result) => result.total),
  })

  // Same key + params as the Tambahan tab's list, so they share one request.
  const { data: addonGroups } = useQuery({
    queryKey: [ADDON_GROUPS_KEY, ADDON_LIST_PARAMS],
    queryFn: () => menuAddonService.list(ADDON_LIST_PARAMS),
  })

  const tabs: PageTab<Tab>[] = [
    { id: "kategori", label: "Kategori Menu", count: categories?.length },
    { id: "menu", label: "Menu", count: menuTotal },
    { id: "tambahan", label: "Tambahan", count: addonGroups?.length },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageTabs
        label="Menu"
        tabs={tabs}
        active={tab}
        onChange={(id) => setSearchParams(id === "kategori" ? {} : { tab: id }, { replace: true })}
      />

      <div role="tabpanel">{tab === "kategori" ? <MenuCategorySection /> : tab === "menu" ? <MenuSection /> : <MenuAddonSection />}</div>
    </div>
  )
}
