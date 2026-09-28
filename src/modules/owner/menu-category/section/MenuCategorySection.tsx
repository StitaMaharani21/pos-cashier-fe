import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LayoutGridIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import {
  deleteMenuCategory,
  listMenuCategories,
  reorderMenuCategories,
  saveMenuCategory,
} from "@/modules/owner/menu-category/api/menu-category.service"
import { MenuCategoryForm } from "@/modules/owner/menu-category/components/MenuCategoryForm"
import { categoryIcon } from "@/modules/owner/menu-category/constants/category-icon"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError } from "@/shared/api/crud/types"
import { STATUS_FILTER_OPTIONS, useClientTable } from "@/shared/hooks/useClientTable"
import { useRowReorder } from "@/shared/hooks/useRowReorder"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { DragHandle } from "@/shared/ui/drag-handle"
import { FilterSelect } from "@/shared/ui/filter-select"
import { PageHeader } from "@/shared/ui/page-header"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { StatusBadge } from "@/shared/ui/status-badge"
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableEmptyRow, TableErrorRow, TableSkeletonRows } from "@/shared/ui/table-states"
import { TableToolbar } from "@/shared/ui/table-toolbar"

const COLUMNS = 6

function errorMessage(error: unknown): string {
  return error instanceof CrudServiceError ? error.message : "Terjadi kesalahan"
}

// "Kategori Menu" tab of /app/menu. All categories are loaded at once
// (search/filter/paging client-side); rows are reordered by dragging.
export function MenuCategorySection() {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const [editing, setEditing] = useState<MenuCategory | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<MenuCategory | null>(null)

  const { data: categories = [], isPending, isError, refetch } = useQuery({
    queryKey: MENU_CATEGORIES_KEY,
    queryFn: listMenuCategories,
  })

  const table = useClientTable({
    rows: categories,
    searchText: (category) => `${category.name ?? ""} ${category.description ?? ""}`,
    filterValue: (category) => category.status,
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

  const deleteMutation = useMutation({
    mutationFn: deleteMenuCategory,
    onSuccess: () => {
      toast.success("Kategori dihapus")
      setDeleting(null)
      invalidate()
      queryClient.invalidateQueries({ queryKey: ["menus"] })
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

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
                    <StatusBadge active={row.status === "active"} />
                  </TableCell>
                  <TableCell>
                    <RowActions>
                      {can("menu", "edit") && (
                        <RowActionButton icon={PencilIcon} label={`Edit ${row.name}`} onClick={() => openForm(row)} />
                      )}
                      {can("menu", "delete") && (
                        <RowActionButton
                          icon={Trash2Icon}
                          tone="danger"
                          label={`Hapus ${row.name}`}
                          onClick={() => setDeleting(row)}
                        />
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
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus kategori?"
        description={
          deleting && (deleting.menu_count ?? 0) > 0
            ? `"${deleting.name}" masih berisi ${deleting.menu_count} menu. Pindahkan menunya dulu sebelum menghapus.`
            : `"${deleting?.name ?? ""}" akan dihapus permanen.`
        }
        isPending={deleteMutation.isPending}
        disabled={(deleting?.menu_count ?? 0) > 0}
        onConfirm={() => deleting?.id != null && deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
