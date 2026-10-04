import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { MENUS_KEY } from "@/modules/owner/menu/constants/menu-display"
import { MenuSection } from "@/modules/owner/menu/section/MenuSection"
import { listMenuCategories } from "@/modules/owner/menu-category/api/menu-category.service"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { MenuCategorySection } from "@/modules/owner/menu-category/section/MenuCategorySection"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"

type Tab = "kategori" | "menu"

// /app/menu — one sidebar entry ("Menu") for both master-data screens, as
// tabs: ?tab=kategori (default) | ?tab=menu. The old /app/menu-category URL
// redirects here (see AppRouter).
export function MenuCatalogSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get("tab") === "menu" ? "menu" : "kategori"

  // Tab badges: the categories list is shared with the Kategori tab's query;
  // the menu total comes from a 1-row page.
  const { data: categories } = useQuery({ queryKey: MENU_CATEGORIES_KEY, queryFn: listMenuCategories })
  const { data: menuTotal } = useQuery({
    queryKey: [...MENUS_KEY, "total"],
    queryFn: () => listMenus({ page: 1, perPage: 1 }).then((result) => result.total),
  })

  const tabs: PageTab<Tab>[] = [
    { id: "kategori", label: "Kategori Menu", count: categories?.length },
    { id: "menu", label: "Menu", count: menuTotal },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageTabs
        label="Menu"
        tabs={tabs}
        active={tab}
        onChange={(id) => setSearchParams(id === "kategori" ? {} : { tab: id }, { replace: true })}
      />

      <div role="tabpanel">{tab === "kategori" ? <MenuCategorySection /> : <MenuSection />}</div>
    </div>
  )
}
