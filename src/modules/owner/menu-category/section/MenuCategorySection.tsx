import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
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
import { useRowReorder } from "@/shared/hooks/useRowReorder"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { DragHandle } from "@/shared/ui/drag-handle"
import { FilterSelect } from "@/shared/ui/filter-select"
import { Input } from "@/shared/ui/input"
import { TablePagination } from "@/shared/ui/table-pagination"

const PER_PAGE = 10
const STATUS_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
]

function errorMessage(error: unknown): string {
  return error instanceof CrudServiceError ? error.message : "Terjadi kesalahan"
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        active ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/60")} />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  )
}

// "Kategori Menu" tab of /app/menu. All categories are loaded at once
// (search/filter/paging client-side); rows are reordered by dragging.
export function MenuCategorySection() {
  const queryClient = useQueryClient()
  const { can } = useCapabilities()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<MenuCategory | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<MenuCategory | null>(null)

  const { data: categories = [], isPending, isError, refetch } = useQuery({
    queryKey: MENU_CATEGORIES_KEY,
    queryFn: listMenuCategories,
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return categories.filter(
      (category) =>
        (status === "all" || category.status === status) &&
        (!term ||
          (category.name ?? "").toLowerCase().includes(term) ||
          (category.description ?? "").toLowerCase().includes(term))
    )
  }, [categories, search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

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
    rows: pageRows,
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

  const filtering = search.trim() !== "" || status !== "all"

  function openForm(row: MenuCategory | null) {
    setEditing(row)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kategori Menu</h1>
        <p className="text-sm text-muted-foreground">{categories.length} kategori terdaftar</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Cari kategori..."
            aria-label="Cari kategori"
            className="h-10 bg-card pl-10"
          />
        </div>
        <FilterSelect
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        />
        {filtering && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setStatus("all")
              setPage(1)
            }}
          >
            Reset filter
          </Button>
        )}
        {can("menu", "create") && (
          <Button className="ml-auto h-10" onClick={() => openForm(null)}>
            <PlusIcon />
            Tambah Kategori
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="w-16 px-6 py-4">Urut</th>
                <th scope="col" className="px-3 py-4">Nama Kategori</th>
                <th scope="col" className="px-3 py-4">Deskripsi</th>
                <th scope="col" className="w-36 px-3 py-4">Jumlah Menu</th>
                <th scope="col" className="w-32 px-3 py-4">Status</th>
                <th scope="col" className="w-28 px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isPending &&
                Array.from({ length: 4 }, (_, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-8 animate-pulse rounded-lg bg-muted" />
                    </td>
                  </tr>
                ))}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    Gagal memuat kategori.{" "}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => refetch()}>
                      Coba lagi
                    </button>
                  </td>
                </tr>
              )}
              {!isPending && !isError && pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    {filtering ? "Tidak ada kategori yang cocok." : "Belum ada kategori menu."}
                  </td>
                </tr>
              )}
              {reorder.orderedRows.map((row) => {
                const id = row.id ?? 0
                const { icon: Icon, tile } = categoryIcon(row.name ?? "", id)
                return (
                  <tr
                    key={id}
                    {...reorder.rowProps(id)}
                    className="border-b transition-colors last:border-0 hover:bg-muted/30 data-[dragging]:bg-primary/5 data-[dragging]:opacity-60"
                  >
                    <td className="px-6 py-3">
                      <DragHandle label={row.name ?? "kategori"} {...reorder.handleProps(id)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tile)}>
                          <Icon className="size-4" />
                        </span>
                        <span className="font-bold whitespace-nowrap text-foreground">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{row.description || "—"}</td>
                    <td className="px-3 py-3 text-foreground">{row.menu_count ?? 0} menu</td>
                    <td className="px-3 py-3">
                      <StatusPill active={row.status === "active"} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        {can("menu", "edit") && (
                          <Button variant="outline" size="icon" aria-label={`Edit ${row.name}`} onClick={() => openForm(row)}>
                            <PencilIcon />
                          </Button>
                        )}
                        {can("menu", "delete") && (
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Hapus ${row.name}`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(row)}
                          >
                            <Trash2Icon />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          total={filtered.length}
          perPage={PER_PAGE}
          noun="kategori"
          onPageChange={setPage}
        />
      </div>

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

      <CrudDialogFrame
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus kategori?"
        description={
          deleting && (deleting.menu_count ?? 0) > 0
            ? `"${deleting.name}" masih berisi ${deleting.menu_count} menu. Pindahkan menunya dulu sebelum menghapus.`
            : `"${deleting?.name ?? ""}" akan dihapus permanen.`
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending || (deleting?.menu_count ?? 0) > 0}
              onClick={() => deleting?.id != null && deleteMutation.mutate(deleting.id)}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </>
        }
      >
        <span className="sr-only">Konfirmasi hapus kategori</span>
      </CrudDialogFrame>
    </div>
  )
}
