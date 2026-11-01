import { DEFAULT_ERROR_MESSAGE } from "@/shared/api/error-message"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PackageIcon, PlusIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import type {
  CreateIngredientPayload,
  Ingredient,
  UpdateIngredientPayload,
} from "@/entities/ingredient/model/ingredient.types"
import { ingredientService, listIngredients } from "@/modules/owner/ingredient/api/ingredient.service"
import { PriceHistorySheet, type PriceHistoryTarget } from "@/modules/owner/price-history/components/PriceHistorySheet"
import { IngredientForm } from "@/modules/owner/ingredient/components/IngredientForm"
import { ingredientColumns } from "@/modules/owner/ingredient/columns/ingredient.columns"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { CrudServiceError, type MasterStatus } from "@/shared/api/crud/types"
import { TABLE_PER_PAGE } from "@/shared/hooks/useClientTable"
import { Button } from "@/shared/ui/button"
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
  const navigate = useNavigate()
  const [priceHistory, setPriceHistory] = useState<PriceHistoryTarget | null>(null)
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

  // Ingredients are never deleted, only switched off: an inactive one is no
  // longer offered for recipes or new stock (menus already using it stay as is).
  const statusMutation = useMutation({
    mutationFn: ({ row, status }: { row: Ingredient; status: MasterStatus }) =>
      ingredientService.setStatus(row.id ?? 0, status, row),
    onSuccess: (_data, { status }) => {
      toast.success(status === "active" ? "Bahan baku diaktifkan" : "Bahan baku dinonaktifkan")
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = ingredientColumns({
    // Stock is changed in one place only: Riwayat Stok → Ubah Stok.
    onManageStock: () => navigate("/app/stock-history"),
    onViewPriceHistory: (row) => setPriceHistory({ type: "ingredient", id: row.id ?? 0, name: row.name ?? "" }),
    onEdit: can("inventory", "edit") ? (row) => setDialogState({ open: true, row }) : undefined,
    onToggleStatus: can("inventory", "edit")
      ? (row) => statusMutation.mutate({ row, status: row.status === "inactive" ? "active" : "inactive" })
      : undefined,
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

      <PriceHistorySheet target={priceHistory} onOpenChange={(open) => !open && setPriceHistory(null)} />

      <CrudDialogFrame
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((state) => ({ ...state, open }))}
        title={dialogState.row ? "Ubah Bahan Baku" : "Tambah Bahan Baku"}
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
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return DEFAULT_ERROR_MESSAGE
}
