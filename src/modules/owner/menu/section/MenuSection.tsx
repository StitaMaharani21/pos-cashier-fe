import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ClockIcon, EyeIcon, PencilIcon, PlusIcon, SearchIcon, StarIcon, StarOffIcon } from "lucide-react"
import { toast } from "sonner"

import type { Menu } from "@/entities/menu/model/menu.types"
import {
  createMenu,
  deleteMenu,
  listMenus,
  reorderMenus,
  setMenuAvailability,
  setMenuFeatured,
  updateMenu,
  type CreateMenuFormPayload,
  type UpdateMenuFormPayload,
} from "@/modules/owner/menu/api/menu.service"
import { MenuForm } from "@/modules/owner/menu/components/MenuForm"
import { MenuPreviewSheet } from "@/modules/owner/menu/components/MenuPreviewSheet"
import { MENUS_KEY, stockLabel } from "@/modules/owner/menu/constants/menu-display"
import { listMenuCategories } from "@/modules/owner/menu-category/api/menu-category.service"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useRowReorder } from "@/shared/hooks/useRowReorder"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { DragHandle } from "@/shared/ui/drag-handle"
import { FilterSelect } from "@/shared/ui/filter-select"
import { Input } from "@/shared/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { Switch } from "@/shared/ui/switch"
import { TablePagination } from "@/shared/ui/table-pagination"

const PER_PAGE = 10
const STATUS_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "available", label: "Tersedia" },
  { value: "unavailable", label: "Tidak tersedia" },
]

function errorMessage(error: unknown): string {
  return error instanceof CrudServiceError ? error.message : "Terjadi kesalahan"
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}

// "Menu" tab of /app/menu. Server-side search/filter/paging; rows are
// reordered by dragging (the backend keeps a filtered/paged drag within the
// rows' own slots, so dragging works with any filter on).
export function MenuSection() {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [categoryId, setCategoryId] = useState("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<Menu | null>(null)
  const [previewing, setPreviewing] = useState<Menu | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, categoryId])

  const { data: categories = [] } = useQuery({
    queryKey: MENU_CATEGORIES_KEY,
    queryFn: listMenuCategories,
  })

  const available = status === "all" ? undefined : status === "available"
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [...MENUS_KEY, page, debouncedSearch, available, categoryId],
    queryFn: () =>
      listMenus({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        categoryId: categoryId === "all" ? undefined : Number(categoryId),
        available,
      }),
  })

  const menus = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  // Menu counts per category live on the categories list, so refresh both.
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: MENUS_KEY }),
      queryClient.invalidateQueries({ queryKey: MENU_CATEGORIES_KEY }),
    ])

  function closeSheet() {
    setSheetOpen(false)
    setEditingRow(null)
  }

  const reorderMutation = useMutation({
    mutationFn: reorderMenus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MENUS_KEY }),
    onError: (error) => {
      toast.error(errorMessage(error))
      reorder.reset()
    },
  })

  const reorder = useRowReorder({
    rows: menus,
    getId: (row) => row.id ?? 0,
    onReorder: (ids) => reorderMutation.mutate(ids),
    enabled: can("menu", "edit") && !reorderMutation.isPending,
  })

  const availabilityMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) => setMenuAvailability(id, value),
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(errorMessage(error)),
  })

  const featuredMutation = useMutation({
    mutationFn: ({ menu, value }: { menu: Menu; value: boolean }) => setMenuFeatured(menu, value),
    onSuccess: (_, { value }) => {
      toast.success(value ? "Ditandai sebagai unggulan" : "Dihapus dari unggulan")
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const createMutation = useMutation({
    mutationFn: createMenu,
    onSuccess: (menu) => {
      toast.success("Menu ditambahkan")
      invalidate()
      if (menu.stock_deduction_method === "by_ingredient") {
        // Keep the sheet open and switch to edit mode on the row that was
        // just created, so RecipeManager (which needs a menu id) becomes
        // usable immediately instead of requiring a second create/edit trip.
        setEditingRow(menu)
      } else {
        closeSheet()
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMenuFormPayload }) => updateMenu(id, payload),
    onSuccess: () => {
      toast.success("Menu diperbarui")
      closeSheet()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      toast.success("Menu dihapus")
      setPreviewing(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const filtering = search.trim() !== "" || status !== "all" || categoryId !== "all"
  const canEdit = can("menu", "edit")

  function openForm(row: Menu | null) {
    setPreviewing(null)
    setEditingRow(row)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menu</h1>
        <p className="text-sm text-muted-foreground">{total} menu terdaftar</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari menu..."
            aria-label="Cari menu"
            className="h-10 bg-card pl-10"
          />
        </div>
        <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <FilterSelect
          label="Kategori"
          value={categoryId}
          options={[
            { value: "all", label: "Semua Kategori" },
            ...categories.map((category) => ({ value: String(category.id), label: category.name ?? "" })),
          ]}
          onChange={setCategoryId}
        />
        {filtering && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setStatus("all")
              setCategoryId("all")
            }}
          >
            Reset filter
          </Button>
        )}
        {can("menu", "create") && (
          <Button className="ml-auto h-10" onClick={() => openForm(null)}>
            <PlusIcon />
            Tambah Menu
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="w-16 px-6 py-4">Urut</th>
                <th scope="col" className="px-3 py-4">Menu</th>
                <th scope="col" className="px-3 py-4">Kategori</th>
                <th scope="col" className="px-3 py-4">Harga</th>
                <th scope="col" className="px-3 py-4">Stok</th>
                <th scope="col" className="px-3 py-4">Estimasi</th>
                <th scope="col" className="px-3 py-4 text-center">Tersedia</th>
                <th scope="col" className="px-3 py-4 text-center">Unggulan</th>
                <th scope="col" className="w-28 px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isPending &&
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td colSpan={9} className="px-6 py-4">
                      <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    </td>
                  </tr>
                ))}
              {isError && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-muted-foreground">
                    Gagal memuat menu.{" "}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => refetch()}>
                      Coba lagi
                    </button>
                  </td>
                </tr>
              )}
              {!isPending && !isError && menus.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-muted-foreground">
                    {filtering ? "Tidak ada menu yang cocok." : "Belum ada menu."}
                  </td>
                </tr>
              )}
              {reorder.orderedRows.map((row) => {
                const id = row.id ?? 0
                const discounted = row.discount && row.final_price !== row.price
                return (
                  <tr
                    key={id}
                    {...reorder.rowProps(id)}
                    className="border-b transition-colors last:border-0 hover:bg-muted/30 data-[dragging]:bg-primary/5 data-[dragging]:opacity-60"
                  >
                    <td className="px-6 py-3">
                      <DragHandle label={row.name ?? "menu"} {...reorder.handleProps(id)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {row.image_url ? (
                          <img src={row.image_url} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {initials(row.name ?? "")}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-foreground">{row.name}</span>
                          <span className="block text-xs text-muted-foreground">{row.code}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-foreground">
                        {row.category_name || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold whitespace-nowrap text-foreground">
                      {formatRupiah(discounted ? (row.final_price ?? 0) : (row.price ?? 0))}
                      {discounted && (
                        <span className="block text-xs font-normal text-muted-foreground line-through">
                          {formatRupiah(row.price ?? 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold whitespace-nowrap text-foreground">{stockLabel(row)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {row.preparation_time ? (
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon className="size-4" />
                          {row.preparation_time} menit
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Switch
                        checked={row.is_available ?? false}
                        disabled={!canEdit || (availabilityMutation.isPending && availabilityMutation.variables?.id === id)}
                        onCheckedChange={(value) => availabilityMutation.mutate({ id, value })}
                        aria-label={`${row.name} tersedia`}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        disabled={!canEdit || (featuredMutation.isPending && featuredMutation.variables?.menu.id === id)}
                        onClick={() => featuredMutation.mutate({ menu: row, value: !row.is_featured })}
                        aria-pressed={row.is_featured ?? false}
                        aria-label={row.is_featured ? `Hapus ${row.name} dari unggulan` : `Jadikan ${row.name} unggulan`}
                        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-50"
                      >
                        {row.is_featured ? (
                          <StarIcon className="size-5 fill-amber-400 text-amber-500" />
                        ) : (
                          <StarOffIcon className="size-5 text-muted-foreground/50" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Button variant="outline" size="icon" aria-label={`Edit ${row.name}`} onClick={() => openForm(row)}>
                            <PencilIcon />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" aria-label={`Lihat ${row.name}`} onClick={() => setPreviewing(row)}>
                          <EyeIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={PER_PAGE}
          noun="menu"
          onPageChange={setPage}
        />
      </div>

      <MenuPreviewSheet
        menu={previewing}
        canEdit={canEdit}
        canDelete={can("menu", "delete")}
        isDeleting={deleteMutation.isPending}
        onClose={() => setPreviewing(null)}
        onEdit={(menu) => openForm(menu)}
        onDelete={(menu) => menu.id != null && deleteMutation.mutate(menu.id)}
      />

      <Sheet open={sheetOpen} onOpenChange={(open) => (open ? setSheetOpen(true) : closeSheet())}>
        <SheetContent className="flex max-w-xl flex-col p-0">
          <SheetHeader className="pr-14">
            <SheetTitle className="text-xl font-bold">{editingRow ? "Edit Menu" : "Tambah Menu"}</SheetTitle>
            <SheetDescription>
              {editingRow ? "Perbarui informasi menu restoran Anda" : "Lengkapi informasi menu baru restoran Anda"}
            </SheetDescription>
          </SheetHeader>
          {/* MenuForm owns the scrolling body and the fixed footer. Keyed so
              switching between rows (or to "Tambah") starts a fresh form. */}
          <MenuForm
            key={editingRow?.id ?? "new"}
            row={editingRow}
            categories={categories}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={closeSheet}
            onSubmit={(payload) => {
              if (editingRow?.id != null) {
                updateMutation.mutate({ id: editingRow.id, payload: payload as UpdateMenuFormPayload })
              } else {
                createMutation.mutate(payload as CreateMenuFormPayload)
              }
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
