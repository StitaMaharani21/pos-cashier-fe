import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { MENUS_KEY } from "@/modules/owner/menu/constants/menu-display"
import { MenuSection } from "@/modules/owner/menu/section/MenuSection"
import { listMenuCategories } from "@/modules/owner/menu-category/api/menu-category.service"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { MenuCategorySection } from "@/modules/owner/menu-category/section/MenuCategorySection"
import { cn } from "@/shared/lib/utils"

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

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "kategori", label: "Kategori Menu", count: categories?.length },
    { id: "menu", label: "Menu", count: menuTotal },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Menu" className="-mb-2 flex gap-2 border-b">
        {tabs.map((item) => {
          const active = item.id === tab
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSearchParams(item.id === "kategori" ? {} : { tab: item.id }, { replace: true })}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-3 pt-1 pb-3 text-sm font-semibold transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">{tab === "kategori" ? <MenuCategorySection /> : <MenuSection />}</div>
    </div>
  )
}
