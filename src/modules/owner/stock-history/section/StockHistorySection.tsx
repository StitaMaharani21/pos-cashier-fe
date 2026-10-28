import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PackageIcon, UtensilsIcon } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { listIngredients } from "@/modules/owner/ingredient/api/ingredient.service"
import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { MENUS_KEY } from "@/modules/owner/menu/constants/menu-display"
import { stockItemColumns } from "@/modules/owner/stock-history/columns/stock-item.columns"
import { AddStockDialog } from "@/modules/owner/stock-history/components/AddStockDialog"
import { StockMovementsSheet } from "@/modules/owner/stock-history/components/StockMovementsSheet"
import {
  ingredientToStockItem,
  menuToStockItem,
  type StockItem,
  type StockSource,
} from "@/modules/owner/stock-history/lib/stock-item"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { PageHeader } from "@/shared/ui/page-header"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableToolbar } from "@/shared/ui/table-toolbar"

const PER_PAGE = TABLE_PER_PAGE
const INGREDIENTS_KEY = ["ingredients"]

type Tab = "bahan-baku" | "menu"

const SOURCE_FOR: Record<Tab, StockSource> = { "bahan-baku": "ingredient", menu: "menu" }

// Every item whose stock is tracked, one tab per kind: bahan baku, and menus
// counted per item (by_menu). Menus that deduct through their recipe have no
// stock of their own — their turnover shows up under the bahan baku. Each row
// opens that item's stock turnover (StockMovementsSheet) or adds stock.
export function StockHistorySection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get("tab") === "menu" ? "menu" : "bahan-baku"
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [historyItem, setHistoryItem] = useState<StockItem | null>(null)
  const [addStockItem, setAddStockItem] = useState<StockItem | null>(null)
  const { can } = useCapabilities()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, tab])

  // Both lists share their prefix with the master-data tables' keys, so adding
  // stock (which invalidates ["ingredients"] / ["menus"]) refreshes them here.
  const ingredientsQuery = useQuery({
    queryKey: [...INGREDIENTS_KEY, "stock-history", page, debouncedSearch],
    queryFn: () => listIngredients({ page, perPage: PER_PAGE, search: debouncedSearch }),
    enabled: tab === "bahan-baku",
  })
  const menusQuery = useQuery({
    queryKey: [...MENUS_KEY, "stock-history", page, debouncedSearch],
    queryFn: () => listMenus({ page, perPage: PER_PAGE, search: debouncedSearch, stockDeductionMethod: "by_menu" }),
    enabled: tab === "menu",
  })

  // Tab badges: 1-row pages, just for the totals.
  const { data: ingredientTotal } = useQuery({
    queryKey: [...INGREDIENTS_KEY, "stock-history", "total"],
    queryFn: () => listIngredients({ page: 1, perPage: 1 }).then((result) => result.total),
  })
  const { data: menuTotal } = useQuery({
    queryKey: [...MENUS_KEY, "stock-history", "total"],
    queryFn: () => listMenus({ page: 1, perPage: 1, stockDeductionMethod: "by_menu" }).then((result) => result.total),
  })

  const active = tab === "bahan-baku" ? ingredientsQuery : menusQuery
  const items: StockItem[] =
    tab === "bahan-baku"
      ? (ingredientsQuery.data?.items ?? []).map(ingredientToStockItem)
      : (menusQuery.data?.items ?? []).map(menuToStockItem)
  const total = active.data?.total ?? 0
  const totalPages = active.data?.totalPages ?? 0

  const tabs: PageTab<Tab>[] = [
    { id: "bahan-baku", label: "Bahan Baku", count: ingredientTotal },
    { id: "menu", label: "Menu", count: menuTotal },
  ]

  const columns = stockItemColumns({
    onViewHistory: setHistoryItem,
    onAddStock: can("inventory", "edit") ? setAddStockItem : undefined,
  })
  const source = SOURCE_FOR[tab]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Riwayat Stok"
        description="Daftar bahan baku dan menu yang stoknya Anda catat. Buka riwayat untuk melihat stok masuk dan keluar."
      />

      <PageTabs
        label="Riwayat Stok"
        tabs={tabs}
        active={tab}
        onChange={(id) => setSearchParams(id === "bahan-baku" ? {} : { tab: id }, { replace: true })}
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={source === "ingredient" ? "Cari bahan baku..." : "Cari menu..."}
        filtering={search.trim() !== ""}
        onReset={() => setSearch("")}
      />

      <CrudTable
        columns={columns}
        rows={items}
        getRowId={(item) => `${item.source}-${item.id}`}
        isLoading={active.isLoading}
        isError={active.isError}
        onRetry={() => active.refetch()}
        minWidth="min-w-[640px]"
        empty={
          debouncedSearch
            ? { title: "Tidak ada yang cocok", hint: "Ubah kata kunci pencarian." }
            : source === "ingredient"
              ? { icon: PackageIcon, title: "Belum ada bahan baku", hint: "Tambahkan bahan baku lewat menu Data Toko → Bahan Baku." }
              : {
                  icon: UtensilsIcon,
                  title: "Belum ada menu yang stoknya dicatat per menu",
                  hint: 'Aktifkan "Hitung stok" → "Per menu" pada menu agar stoknya tercatat di sini.',
                }
        }
        footer={
          !active.isLoading &&
          total > 0 && (
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              perPage={PER_PAGE}
              noun={source === "ingredient" ? "bahan baku" : "menu"}
              onPageChange={setPage}
            />
          )
        }
      />

      <StockMovementsSheet
        item={historyItem}
        onOpenChange={(open) => !open && setHistoryItem(null)}
        onAddStock={can("inventory", "edit") ? setAddStockItem : undefined}
      />
      <AddStockDialog item={addStockItem} onOpenChange={(open) => !open && setAddStockItem(null)} />
    </div>
  )
}
