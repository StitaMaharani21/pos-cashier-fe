import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BikeIcon, ShoppingBagIcon, UtensilsIcon, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import type { OrderType } from "@/entities/order-type/model/order-type.types"
import { listOrderTypes, updateOrderType } from "@/modules/owner/order-type/api/order-type.service"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useRowReorder } from "@/shared/hooks/useRowReorder"
import { ORDER_TYPE_LABEL } from "@/shared/lib/order-type-label"
import { DragHandle } from "@/shared/ui/drag-handle"
import { Switch } from "@/shared/ui/switch"

const ORDER_TYPE_META: Record<string, { label: string; icon: LucideIcon }> = {
  dine_in: { label: ORDER_TYPE_LABEL.dine_in, icon: UtensilsIcon },
  takeaway: { label: ORDER_TYPE_LABEL.takeaway, icon: ShoppingBagIcon },
  delivery: { label: ORDER_TYPE_LABEL.delivery, icon: BikeIcon },
}

const QUERY_KEY = ["order-types"]

function errorMessage(error: unknown): string {
  return error instanceof CrudServiceError ? error.message : "Gagal menyimpan perubahan"
}

export function OrderTypeSection() {
  const queryClient = useQueryClient()
  const { data: orderTypes = [], isPending } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: listOrderTypes,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const toggleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { enabled: boolean; sort_order: number } }) =>
      updateOrderType(id, payload),
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error)),
  })

  // The backend has no bulk-reorder endpoint for order types (there are only
  // 3 rows), so a drag saves each row whose position changed with its new
  // index as `sort_order`. Rows keep the `enabled` value they were loaded with.
  const reorderMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const byId = new Map(orderTypes.map((row) => [row.id ?? 0, row]))
      for (const [index, id] of ids.entries()) {
        const row = byId.get(id)
        if (!row || row.sort_order === index) continue
        await updateOrderType(id, { enabled: row.enabled ?? true, sort_order: index })
      }
    },
    // Success or failure, reload so the list shows what the server really has.
    onSettled: invalidate,
    onError: (error) => {
      toast.error(errorMessage(error))
      reorder.reset()
    },
  })

  const reorder = useRowReorder({
    rows: orderTypes,
    getId: (row) => row.id ?? 0,
    onReorder: (ids) => reorderMutation.mutate(ids),
    enabled: !reorderMutation.isPending,
  })

  function toggleEnabled(row: OrderType, enabled: boolean) {
    toggleMutation.mutate({ id: row.id ?? 0, payload: { enabled, sort_order: row.sort_order ?? 0 } })
  }

  return (
    <div className="flex flex-col gap-1 rounded-[18px] border bg-card px-6 py-6">
      <h1 className="text-xl font-bold text-foreground">Jenis Pesanan</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Atur jenis pesanan yang bisa dipilih kasir. Seret untuk mengubah urutan tampilnya.
      </p>

      <div className="flex flex-col gap-3">
        {isPending && <p className="py-8 text-center text-sm text-muted-foreground">Memuat...</p>}

        {!isPending && orderTypes.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada jenis pesanan.
          </p>
        )}

        {reorder.orderedRows.map((row) => {
          const meta = ORDER_TYPE_META[row.type ?? ""] ?? {
            label: row.type ?? "",
            icon: UtensilsIcon,
          }
          const Icon = meta.icon
          const id = row.id ?? 0
          return (
            <div
              key={id}
              {...reorder.rowProps(id)}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4 data-[dragging]:bg-primary/5 data-[dragging]:opacity-60"
            >
              <div className="flex items-center gap-3">
                <DragHandle label={meta.label} {...reorder.handleProps(id)} />
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-strong">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm font-bold text-foreground">{meta.label}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Aktif</span>
                <Switch
                  checked={row.enabled ?? false}
                  onCheckedChange={(checked) => toggleEnabled(row, checked)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
