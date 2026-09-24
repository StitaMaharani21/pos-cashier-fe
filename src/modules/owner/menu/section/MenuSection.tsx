import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import {
  createMenu,
  deleteMenu,
  listMenus,
  updateMenu,
  type CreateMenuFormPayload,
  type UpdateMenuFormPayload,
} from "@/modules/owner/menu/api/menu.service"
import { menuColumns } from "@/modules/owner/menu/columns/menu.columns"
import { MenuForm } from "@/modules/owner/menu/components/MenuForm"
import { apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse } from "@/shared/api/crud/types"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { Input } from "@/shared/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"

const PER_PAGE = 5

async function listAllCategories(): Promise<MenuCategory[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<MenuCategory>>(
      "/master/menu-categories",
      { params: { page: 1, per_page: 100 } }
    )
    return response.data.data
  } catch {
    return []
  }
}

export function MenuSection() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<Menu | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, categoryId])

  const { data: categories = [] } = useQuery({
    queryKey: ["menu-categories", "all"],
    queryFn: listAllCategories,
  })

  const listQueryKey = ["menus", page, debouncedSearch, categoryId]
  const { data, isLoading } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listMenus({ page, perPage: PER_PAGE, search: debouncedSearch, categoryId }),
  })

  const menus = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["menus"] })

  function closeSheet() {
    setSheetOpen(false)
    setEditingRow(null)
  }

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
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMenuFormPayload }) =>
      updateMenu(id, payload),
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
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = menuColumns({
    onEdit: (row) => {
      setEditingRow(row)
      setSheetOpen(true)
    },
    onDelete: (row) => {
      if (row.id != null) deleteMutation.mutate(row.id)
    },
  })

  const rangeStart = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, total)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Menu</h1>
          <p className="text-sm text-muted-foreground">{total} menu</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari menu..."
            className="pl-9"
          />
        </div>

        <button
          type="button"
          onClick={() => setCategoryId(undefined)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium",
            categoryId === undefined
              ? "border-primary bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Semua
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryId(category.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium",
              categoryId === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {category.name}
          </button>
        ))}

        <Button
          onClick={() => {
            setEditingRow(null)
            setSheetOpen(true)
          }}
        >
          <PlusIcon />
          Tambah Menu
        </Button>
      </div>

      <div className="rounded-[18px] border bg-card p-2">
        <CrudTable
          columns={columns}
          rows={menus}
          getRowId={(row) => row.id ?? 0}
          isLoading={isLoading}
          emptyMessage="Belum ada menu."
        />

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Menampilkan {rangeStart}–{rangeEnd} dari {total} menu
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="flex size-7 items-center justify-center rounded-md border text-muted-foreground disabled:opacity-40"
              aria-label="Sebelumnya"
            >
              <ChevronLeftIcon className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="flex size-7 items-center justify-center rounded-md border text-muted-foreground disabled:opacity-40"
              aria-label="Berikutnya"
            >
              <ChevronRightIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open) => (open ? setSheetOpen(true) : closeSheet())}>
        <SheetContent className="flex flex-col p-0">
          <SheetHeader>
            <SheetTitle>{editingRow ? "Edit Menu" : "Tambah Menu"}</SheetTitle>
            <SheetDescription className="sr-only">
              Form {editingRow ? "edit" : "tambah"} menu
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
            <MenuForm
              row={editingRow}
              categories={categories}
              isSubmitting={isSubmitting}
              onCancel={closeSheet}
              onSubmit={(payload) => {
                if (editingRow?.id != null) {
                  updateMutation.mutate({ id: editingRow.id, payload: payload as UpdateMenuFormPayload })
                } else {
                  createMutation.mutate(payload as CreateMenuFormPayload)
                }
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}
