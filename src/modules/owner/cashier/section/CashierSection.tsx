import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Cashier } from "@/entities/cashier/model/cashier.types"
import {
  createCashier,
  getCashierLimit,
  listCashiers,
  updateCashierStatus,
} from "@/modules/owner/cashier/api/cashier.service"
import { CashierForm } from "@/modules/owner/cashier/components/CashierForm"
import { CashierLimitCard } from "@/modules/owner/cashier/components/CashierLimitCard"
import { makeCashierColumns } from "@/modules/owner/cashier/columns/cashier.columns"
import { CrudServiceError } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

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

  const createMutation = useMutation({
    mutationFn: createCashier,
    onSuccess: () => {
      toast.success("Kasir ditambahkan")
      setCreateOpen(false)
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

  const columns = makeCashierColumns({
    isToggling: statusMutation.isPending,
    onToggleStatus: (row: Cashier) =>
      statusMutation.mutate({
        id: row.id,
        status: row.status === "active" ? "inactive" : "active",
      }),
  })

  return (
    <div className="flex flex-col gap-4">
      <CashierLimitCard />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kasir</h2>
        <Button onClick={() => setCreateOpen(true)} disabled={atQuota}>
          Tambah Kasir
        </Button>
      </div>

      <CrudTable
        columns={columns}
        rows={cashiers}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Belum ada kasir."
      />

      <CrudDialogFrame open={createOpen} onOpenChange={setCreateOpen} title="Tambah Kasir">
        <CashierForm
          isSubmitting={createMutation.isPending}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      </CrudDialogFrame>
    </div>
  )
}
