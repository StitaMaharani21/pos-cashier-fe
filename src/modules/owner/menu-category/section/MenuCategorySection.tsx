import { DEFAULT_ERROR_MESSAGE } from "@/shared/api/error-message"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LayoutGridIcon, PencilIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import {
  listMenuCategories,
  reorderMenuCategories,
  saveMenuCategory,
  setMenuCategoryStatus,
} from "@/modules/owner/menu-category/api/menu-category.service"
import { MenuCategoryForm } from "@/modules/owner/menu-category/components/MenuCategoryForm"
import { categoryIcon } from "@/modules/owner/menu-category/constants/category-icon"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError, type MasterStatus } from "@/shared/api/crud/types"
import { STATUS_FILTER_OPTIONS, useClientTable } from "@/shared/hooks/useClientTable"
import { useRowReorder } from "@/shared/hooks/useRowReorder"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { DragHandle } from "@/shared/ui/drag-handle"
import { FilterSelect } from "@/shared/ui/filter-select"
import { PageHeader } from "@/shared/ui/page-header"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { StatusToggle } from "@/shared/ui/status-toggle"
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableEmptyRow, TableErrorRow, TableSkeletonRows } from "@/shared/ui/table-states"
import { TableToolbar } from "@/shared/ui/table-toolbar"

const COLUMNS = 6

function errorMessage(error: unknown): string {
  return error instanceof CrudServiceError ? error.message : DEFAULT_ERROR_MESSAGE
}

// "Kategori Menu" tab of /app/menu. All categories are loaded at once
// (search/filter/paging client-side); rows are reordered by dragging.
export function MenuCategorySection() {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const [editing, setEditing] = useState<MenuCategory | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deactivating, setDeactivating] = useState<MenuCategory | null>(null)

  const { data: categories = [], isPending, isError, refetch } = useQuery({
    queryKey: MENU_CATEGORIES_KEY,
    queryFn: listMenuCategories,
  })

  const table = useClientTable({
    rows: categories,
    searchText: (category) => `${category.name ?? ""} ${category.description ?? ""}`,
    filterValue: (category) => (category.status === "inactive" ? "inactive" : "active"),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MENU_CATEGORIES_KEY })

  const reorderMutation = useMutation({
    mutationFn: reorderMenuCategories,
    onSuccess: () => invalidate(),
    onError: (error) => {
      toast.error(errorMessage(error))
      reorder.reset()
    },
  })

  const reorder = useRowReorder({
    rows: table.pageRows,
    getId: (row) => row.id ?? 0,
    onReorder: (ids) => reorderMutation.mutate(ids),
    enabled: can("menu", "edit") && !reorderMutation.isPending,
  })

  const saveMutation = useMutation({
    mutationFn: (values: Parameters<typeof saveMenuCategory>[1]) =>
      saveMenuCategory(editing?.id ?? null, values),
    onSuccess: () => {
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan")
      setFormOpen(false)
      setEditing(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  // Categories are never deleted. While one is inactive its menus are hidden
  // from the cashier app too, so the menu list is refreshed as well.
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MasterStatus }) => setMenuCategoryStatus(id, status),
    onSuccess: (_data, { status }) => {
      toast.success(status === "active" ? "Kategori diaktifkan" : "Kategori dinonaktifkan")
      setDeactivating(null)
      invalidate()
      queryClient.invalidateQueries({ queryKey: ["menus"] })
    },
    onError: (error) => {
      setDeactivating(null)
      toast.error(errorMessage(error))
    },
  })

  // Switching on is immediate. Switching off asks first only when the category
  // still has menus, since they all disappear from the cashier app with it.
  function toggleStatus(row: MenuCategory) {
    if (row.id == null) return
    if (row.status === "inactive") statusMutation.mutate({ id: row.id, status: "active" })
    else if ((row.menu_count ?? 0) > 0) setDeactivating(row)
    else statusMutation.mutate({ id: row.id, status: "inactive" })
  }

  function openForm(row: MenuCategory | null) {
    setEditing(row)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kategori Menu" description={`${categories.length} kategori terdaftar`} />

      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Cari kategori..."
        filtering={table.filtering}
        onReset={table.reset}
        action={
          can("menu", "create") && (
            <Button className="h-10" onClick={() => openForm(null)}>
              <PlusIcon />
              Tambah Kategori
            </Button>
          )
        }
      >
        <FilterSelect label="Status" value={table.filter} options={STATUS_FILTER_OPTIONS} onChange={table.setFilter} />
      </TableToolbar>

      <TableCard
        footer={
          !isPending &&
          table.total > 0 && (
            <TablePagination
              page={table.page}
              totalPages={table.totalPages}
              total={table.total}
              perPage={table.perPage}
              noun="kategori"
              onPageChange={table.setPage}
            />
          )
        }
      >
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urut</TableHead>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-36 text-right">Jumlah Menu</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && <TableSkeletonRows colSpan={COLUMNS} />}
            {isError && <TableErrorRow colSpan={COLUMNS} title="Gagal memuat kategori" onRetry={() => refetch()} />}
            {!isPending && !isError && table.pageRows.length === 0 && (
              <TableEmptyRow
                colSpan={COLUMNS}
                {...(table.filtering
                  ? { title: "Tidak ada kategori yang cocok", hint: "Ubah kata kunci atau filter." }
                  : {
                      icon: LayoutGridIcon,
                      title: "Belum ada kategori menu",
                      hint: "Kategori mengelompokkan menu di aplikasi kasir.",
                    })}
              />
            )}
            {reorder.orderedRows.map((row) => {
              const id = row.id ?? 0
              const { icon, tile } = categoryIcon(row.name ?? "", id)
              return (
                <TableRow
                  key={id}
                  {...reorder.rowProps(id)}
                  className="data-[dragging]:bg-primary/5 data-[dragging]:opacity-60"
                >
                  <TableCell>
                    <DragHandle label={row.name ?? "kategori"} {...reorder.handleProps(id)} />
                  </TableCell>
                  <TableCell>
                    <TitleCell leading={<IconTile icon={icon} className={tile} />} title={row.name} />
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">{row.description || "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.menu_count ?? 0} menu</TableCell>
                  <TableCell>
                    <StatusToggle
                      active={row.status !== "inactive"}
                      label={row.name ?? "kategori"}
                      disabled={!can("menu", "edit") || (statusMutation.isPending && statusMutation.variables?.id === id)}
                      onToggle={() => toggleStatus(row)}
                    />
                  </TableCell>
                  <TableCell>
                    <RowActions>
                      {can("menu", "edit") && (
                        <RowActionButton icon={PencilIcon} label={`Ubah ${row.name}`} onClick={() => openForm(row)} />
                      )}
                    </RowActions>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableCard>

      <CrudDialogFrame
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        title={editing ? "Edit Kategori" : "Tambah Kategori"}
      >
        <MenuCategoryForm
          key={editing?.id ?? "new"}
          row={editing}
          isSubmitting={saveMutation.isPending}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={() => setFormOpen(false)}
        />
      </CrudDialogFrame>

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Nonaktifkan kategori?"
        description={
          deactivating && (deactivating.menu_count ?? 0) > 0
            ? `"${deactivating.name}" berisi ${deactivating.menu_count} menu. Selama kategori nonaktif, semua menunya ikut disembunyikan dari kasir dan pesan mandiri; menunya tidak berubah dan tampil lagi saat kategori diaktifkan kembali.`
            : `"${deactivating?.name ?? ""}" tidak akan tampil di kasir, tetapi datanya tetap tersimpan dan bisa diaktifkan kembali.`
        }
        confirmLabel="Nonaktifkan"
        pendingLabel="Menonaktifkan..."
        isPending={statusMutation.isPending}
        onConfirm={() =>
          deactivating?.id != null && statusMutation.mutate({ id: deactivating.id, status: "inactive" })
        }
      />
    </div>
  )
}
