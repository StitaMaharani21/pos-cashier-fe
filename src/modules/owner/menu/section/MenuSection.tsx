import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ClockIcon, EyeIcon, PencilIcon, PlusIcon, StarIcon, StarOffIcon, UtensilsCrossedIcon } from "lucide-react"
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
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { useRowReorder } from "@/shared/hooks/useRowReorder"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { DragHandle } from "@/shared/ui/drag-handle"
import { FilterSelect } from "@/shared/ui/filter-select"
import { PageHeader } from "@/shared/ui/page-header"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { Switch } from "@/shared/ui/switch"
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { TitleCell } from "@/shared/ui/table-cells"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableEmptyRow, TableErrorRow, TableSkeletonRows } from "@/shared/ui/table-states"
import { TableToolbar } from "@/shared/ui/table-toolbar"

const PER_PAGE = TABLE_PER_PAGE
const COLUMNS = 9
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
      <PageHeader title="Menu" description={`${total} menu terdaftar`} />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari menu..."
        filtering={filtering}
        onReset={() => {
          setSearch("")
          setStatus("all")
          setCategoryId("all")
        }}
        action={
          can("menu", "create") && (
            <Button className="h-10" onClick={() => openForm(null)}>
              <PlusIcon />
              Tambah Menu
            </Button>
          )
        }
      >
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
      </TableToolbar>

      <TableCard
        footer={
          !isPending &&
          total > 0 && (
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              perPage={PER_PAGE}
              noun="menu"
              onPageChange={setPage}
            />
          )
        }
      >
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urut</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead>Estimasi</TableHead>
              <TableHead className="text-center">Tersedia</TableHead>
              <TableHead className="text-center">Unggulan</TableHead>
              <TableHead className="w-28 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && <TableSkeletonRows colSpan={COLUMNS} />}
            {isError && <TableErrorRow colSpan={COLUMNS} title="Gagal memuat menu" onRetry={() => refetch()} />}
            {!isPending && !isError && menus.length === 0 && (
              <TableEmptyRow
                colSpan={COLUMNS}
                {...(filtering
                  ? { title: "Tidak ada menu yang cocok", hint: "Ubah kata kunci atau filter." }
                  : {
                      icon: UtensilsCrossedIcon,
                      title: "Belum ada menu",
                      hint: "Tambahkan menu yang dijual di aplikasi kasir.",
                    })}
              />
            )}
            {reorder.orderedRows.map((row) => {
              const id = row.id ?? 0
              const discounted = row.discount && row.final_price !== row.price
              return (
                <TableRow
                  key={id}
                  {...reorder.rowProps(id)}
                  className="data-[dragging]:bg-primary/5 data-[dragging]:opacity-60"
                >
                  <TableCell>
                    <DragHandle label={row.name ?? "menu"} {...reorder.handleProps(id)} />
                  </TableCell>
                  <TableCell>
                    <TitleCell
                      leading={
                        row.image_url ? (
                          <img src={row.image_url} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {initials(row.name ?? "")}
                          </span>
                        )
                      }
                      title={row.name}
                      subtitle={row.code}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                      {row.category_name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {formatRupiah(discounted ? (row.final_price ?? 0) : (row.price ?? 0))}
                    {discounted && (
                      <span className="block text-xs font-normal text-muted-foreground line-through">
                        {formatRupiah(row.price ?? 0)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{stockLabel(row)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.preparation_time ? (
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="size-4" />
                        {row.preparation_time} menit
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={row.is_available ?? false}
                      disabled={!canEdit || (availabilityMutation.isPending && availabilityMutation.variables?.id === id)}
                      onCheckedChange={(value) => availabilityMutation.mutate({ id, value })}
                      aria-label={`${row.name} tersedia`}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
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
                  </TableCell>
                  <TableCell>
                    <RowActions>
                      {canEdit && <RowActionButton icon={PencilIcon} label={`Edit ${row.name}`} onClick={() => openForm(row)} />}
                      <RowActionButton icon={EyeIcon} label={`Lihat ${row.name}`} onClick={() => setPreviewing(row)} />
                    </RowActions>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableCard>

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
