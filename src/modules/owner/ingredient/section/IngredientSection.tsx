import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react"
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
import { CrudServiceError } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { Input } from "@/shared/ui/input"

const PER_PAGE = 10

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

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const listQueryKey = ["ingredients", page, debouncedSearch]
  const { data, isLoading } = useQuery({
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
      closeDialog()
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

  const columns = ingredientColumns({ onAdjustStock: (row) => setStockDialogRow(row) })

  const rangeStart = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, total)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bahan Baku</h1>
          <p className="text-sm text-muted-foreground">{total} bahan baku</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari bahan baku..."
            className="pl-9"
          />
        </div>

        <Button onClick={() => setDialogState({ open: true, row: null })}>
          <PlusIcon />
          Tambah Bahan Baku
        </Button>
      </div>

      <div className="rounded-[18px] border bg-card p-2">
        <CrudTable
          columns={columns}
          rows={ingredients}
          getRowId={(row) => row.id ?? 0}
          isLoading={isLoading}
          emptyMessage="Belum ada bahan baku."
          onRowClick={(row) => setDialogState({ open: true, row })}
        />

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Menampilkan {rangeStart}–{rangeEnd} dari {total} bahan baku
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

      <CrudDialogFrame
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((state) => ({ ...state, open }))}
        title={dialogState.row ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
        footer={
          dialogState.row && (
            <Button
              type="button"
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(dialogState.row!.id ?? 0)}
            >
              Hapus
            </Button>
          )
        }
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
