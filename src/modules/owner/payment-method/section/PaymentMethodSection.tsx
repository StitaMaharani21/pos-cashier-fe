import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.types"
import {
  createPaymentMethod,
  deletePaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
} from "@/modules/owner/payment-method/api/payment-method.service"
import { paymentMethodColumns } from "@/modules/owner/payment-method/columns/payment-method.columns"
import { PaymentMethodForm } from "@/modules/owner/payment-method/components/PaymentMethodForm"
import { CrudServiceError } from "@/shared/api/crud/types"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

const QUERY_KEY = ["payment-methods"]

// Bespoke — not CrudSection — the Figma design keeps the add/edit form
// permanently visible beside the table rather than behind a toggleable
// dialog, so the table+form composition is hand-wired here instead.
export function PaymentMethodSection() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [formKey, setFormKey] = useState(0)

  const { data: methods = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: listPaymentMethods,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  function resetForm() {
    setSelected(null)
    setFormKey((key) => key + 1)
  }

  const createMutation = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      toast.success("Metode pembayaran ditambahkan")
      resetForm()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updatePaymentMethod>[1] }) =>
      updatePaymentMethod(id, payload),
    onSuccess: () => {
      toast.success("Metode pembayaran diperbarui")
      resetForm()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      toast.success("Metode pembayaran dihapus")
      resetForm()
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = paymentMethodColumns({
    onEdit: (row) => {
      setSelected(row)
      setFormKey((key) => key + 1)
    },
    onDelete: (row) => {
      if (row.id != null) deleteMutation.mutate(row.id)
    },
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Metode Pembayaran</h1>
          <p className="text-sm text-muted-foreground">{methods.length} metode</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[18px] border bg-card p-2">
          <CrudTable
            columns={columns}
            rows={methods}
            getRowId={(row) => row.id ?? 0}
            isLoading={isLoading}
            emptyMessage="Belum ada metode pembayaran."
          />
        </div>

        <div className="flex flex-col gap-4 rounded-[18px] border bg-card px-6 py-6">
          <h2 className="text-base font-extrabold text-foreground">
            {selected ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
          </h2>
          <PaymentMethodForm
            key={formKey}
            row={selected}
            existing={methods}
            isSubmitting={isSubmitting}
            onCancel={resetForm}
            onSubmit={(values) => {
              if (selected?.id != null) {
                updateMutation.mutate({ id: selected.id, payload: values })
              } else {
                createMutation.mutate(values)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}
