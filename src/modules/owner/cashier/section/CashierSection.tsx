import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PlusIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import type { Cashier, CreateCashierPayload } from "@/entities/cashier/model/cashier.types"
import {
  createCashier,
  deleteCashierPhoto,
  getCashierLimit,
  listCashiers,
  updateCashierStatus,
  uploadCashierPhoto,
} from "@/modules/owner/cashier/api/cashier.service"
import { CashierForm } from "@/modules/owner/cashier/components/CashierForm"
import { CashierLimitCard } from "@/modules/owner/cashier/components/CashierLimitCard"
import { CashierPhotoDialog } from "@/modules/owner/cashier/components/CashierPhotoDialog"
import { makeCashierColumns } from "@/modules/owner/cashier/columns/cashier.columns"
import { CrudServiceError } from "@/shared/api/crud/types"
import { STATUS_FILTER_OPTIONS, useClientTable } from "@/shared/hooks/useClientTable"
import { Button } from "@/shared/ui/button"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { FilterSelect } from "@/shared/ui/filter-select"
import { PageHeader } from "@/shared/ui/page-header"
import { TablePagination } from "@/shared/ui/table-pagination"
import { TableToolbar } from "@/shared/ui/table-toolbar"

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}

// No createCrudService/CrudSection here — the backend has no full "edit"
// for a cashier (create + list + a narrow status toggle only), so this is
// hand-wired with react-query directly, reusing CrudTable/CrudDialogFrame
// on their own. See this module's README.
export function CashierSection() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [photoCashier, setPhotoCashier] = useState<Cashier | null>(null)

  const { data: cashiers = [], isLoading } = useQuery({
    queryKey: ["cashiers", "list"],
    queryFn: () => listCashiers(1, 100),
  })

  const { data: limit } = useQuery({
    queryKey: ["cashiers", "limit"],
    queryFn: getCashierLimit,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cashiers"] })
  }

  // The create endpoint is JSON-only: the photo goes up right after the
  // account exists. A failed photo upload doesn't undo the account — the
  // owner can retry from the row's "Foto".
  const createMutation = useMutation({
    mutationFn: async ({ payload, photo }: { payload: CreateCashierPayload; photo: File | null }) => {
      const cashier = await createCashier(payload)
      if (!photo) return { photoError: null }
      try {
        await uploadCashierPhoto(cashier.id, photo)
        return { photoError: null }
      } catch (error) {
        return { photoError: errorMessage(error) }
      }
    },
    onSuccess: ({ photoError }) => {
      if (photoError) toast.warning(`Kasir ditambahkan, tapi foto gagal diunggah: ${photoError}`)
      else toast.success("Kasir ditambahkan")
      setCreateOpen(false)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const photoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File | null }) =>
      file ? uploadCashierPhoto(id, file) : deleteCashierPhoto(id),
    onSuccess: (_, { file }) => {
      toast.success(file ? "Foto kasir diperbarui" : "Foto kasir dihapus")
      setPhotoCashier(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "inactive" }) =>
      updateCashierStatus(id, { status }),
    onSuccess: () => {
      toast.success("Status kasir diperbarui")
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const atQuota = limit != null && limit.used >= limit.limit
  const table = useClientTable({
    rows: cashiers,
    searchText: (row) => `${row.name} ${row.username} ${row.phone_no}`,
    filterValue: (row) => row.status,
  })

  const columns = makeCashierColumns({
    isToggling: statusMutation.isPending,
    onOpenPhoto: setPhotoCashier,
    onToggleStatus: (row: Cashier) =>
      statusMutation.mutate({
        id: row.id,
        status: row.status === "active" ? "inactive" : "active",
      }),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengguna" description={`${cashiers.length} akun kasir terdaftar`} />

      <CashierLimitCard />

      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Cari nama, username, atau no. HP..."
        filtering={table.filtering}
        onReset={table.reset}
        action={
          <Button
            className="h-10"
            onClick={() => setCreateOpen(true)}
            disabled={atQuota}
            title={atQuota ? "Kuota kasir paket ini sudah penuh" : undefined}
          >
            <PlusIcon />
            Tambah Kasir
          </Button>
        }
      >
        <FilterSelect label="Status" value={table.filter} options={STATUS_FILTER_OPTIONS} onChange={table.setFilter} />
      </TableToolbar>

      <CrudTable
        columns={columns}
        rows={table.pageRows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        empty={
          table.filtering
            ? { title: "Tidak ada kasir yang cocok", hint: "Ubah kata kunci atau filter." }
            : { icon: UsersIcon, title: "Belum ada kasir", hint: "Tambahkan akun kasir untuk login di aplikasi kasir dengan PIN." }
        }
        footer={
          !isLoading &&
          table.total > 0 && (
            <TablePagination
              page={table.page}
              totalPages={table.totalPages}
              total={table.total}
              perPage={table.perPage}
              noun="kasir"
              onPageChange={table.setPage}
            />
          )
        }
      />

      <CrudDialogFrame open={createOpen} onOpenChange={setCreateOpen} title="Tambah Kasir">
        <CashierForm
          isSubmitting={createMutation.isPending}
          onSubmit={(payload, photo) => createMutation.mutate({ payload, photo })}
        />
      </CrudDialogFrame>

      <CashierPhotoDialog
        cashier={photoCashier}
        onOpenChange={(open) => !open && setPhotoCashier(null)}
        isSaving={photoMutation.isPending}
        onSave={(cashier, file) => photoMutation.mutate({ id: cashier.id, file })}
      />
    </div>
  )
}
