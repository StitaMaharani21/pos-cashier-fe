import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PackageIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import type {
  CreateIngredientPayload,
  Ingredient,
  UpdateIngredientPayload,
} from "@/entities/ingredient/model/ingredient.types"
import {
  adjustIngredientStock,
  ingredientService,
  listIngredients,
} from "@/modules/owner/ingredient/api/ingredient.service"
import { AdjustIngredientStockDialog } from "@/modules/owner/ingredient/components/AdjustIngredientStockDialog"
import { IngredientForm } from "@/modules/owner/ingredient/components/IngredientForm"
import { ingredientColumns } from "@/modules/owner/ingredient/columns/ingredient.columns"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError } from "@/shared/api/crud/types"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { PageHeader } from "@/shared/ui/page-header"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableToolbar } from "@/shared/ui/table-toolbar"

const PER_PAGE = TABLE_PER_PAGE

export function IngredientSection() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [dialogState, setDialogState] = useState<{ open: boolean; row: Ingredient | null }>({
    open: false,
    row: null,
  })
  const [stockDialogRow, setStockDialogRow] = useState<Ingredient | null>(null)
  const [deleting, setDeleting] = useState<Ingredient | null>(null)
  const { can } = useCapabilities()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const listQueryKey = ["ingredients", page, debouncedSearch]
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listIngredients({ page, perPage: PER_PAGE, search: debouncedSearch }),
  })

  const ingredients = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["ingredients"] })
  const closeDialog = () => setDialogState({ open: false, row: null })

  const createMutation = useMutation({
    mutationFn: (payload: CreateIngredientPayload) => ingredientService.create(payload),
    onSuccess: () => {
      toast.success("Bahan baku ditambahkan")
      closeDialog()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateIngredientPayload }) =>
      ingredientService.update(id, payload),
    onSuccess: () => {
      toast.success("Bahan baku diperbarui")
      closeDialog()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => ingredientService.remove(id),
    onSuccess: () => {
      toast.success("Bahan baku dihapus")
      setDeleting(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, delta, keterangan }: { id: number; delta: number; keterangan: string }) =>
      adjustIngredientStock(id, { delta, keterangan }),
    onSuccess: () => {
      toast.success("Stok disesuaikan")
      setStockDialogRow(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = ingredientColumns({
    onAdjustStock: (row) => setStockDialogRow(row),
    onEdit: can("inventory", "edit") ? (row) => setDialogState({ open: true, row }) : undefined,
    onDelete: can("inventory", "delete") ? setDeleting : undefined,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bahan Baku" description={`${total} bahan baku terdaftar`} />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari bahan baku..."
        filtering={search.trim() !== ""}
        onReset={() => setSearch("")}
        action={
          can("inventory", "create") && (
            <Button className="h-10" onClick={() => setDialogState({ open: true, row: null })}>
              <PlusIcon />
              Tambah Bahan Baku
            </Button>
          )
        }
      />

      <CrudTable
        columns={columns}
        rows={ingredients}
        getRowId={(row) => row.id ?? 0}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        empty={
          debouncedSearch
            ? { title: "Tidak ada bahan baku yang cocok", hint: "Ubah kata kunci pencarian." }
            : { icon: PackageIcon, title: "Belum ada bahan baku", hint: "Tambahkan bahan baku untuk resep dan pelacakan stok." }
        }
        footer={
          !isLoading &&
          total > 0 && (
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              perPage={PER_PAGE}
              noun="bahan baku"
              onPageChange={setPage}
            />
          )
        }
      />

      <CrudDialogFrame
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((state) => ({ ...state, open }))}
        title={dialogState.row ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
      >
        <IngredientForm
          row={dialogState.row}
          isSubmitting={isSubmitting}
          onSubmit={(payload) => {
            if (dialogState.row) {
              updateMutation.mutate({
                id: dialogState.row.id ?? 0,
                payload: payload as UpdateIngredientPayload,
              })
            } else {
              createMutation.mutate(payload as CreateIngredientPayload)
            }
          }}
        />
      </CrudDialogFrame>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus bahan baku?"
        description={deleting ? `"${deleting.name}" akan dihapus permanen.` : undefined}
        isPending={removeMutation.isPending}
        onConfirm={() => deleting && removeMutation.mutate(deleting.id ?? 0)}
      />

      <AdjustIngredientStockDialog
        row={stockDialogRow}
        isSubmitting={adjustStockMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setStockDialogRow(null)
        }}
        onSubmit={(delta, keterangan) => {
          if (stockDialogRow) {
            adjustStockMutation.mutate({ id: stockDialogRow.id ?? 0, delta, keterangan })
          }
        }}
      />
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}
