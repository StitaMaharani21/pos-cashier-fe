import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BikeIcon, ShoppingBagIcon, UtensilsIcon, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import type { OrderType } from "@/entities/order-type/model/order-type.types"
import { listOrderTypes, updateOrderType } from "@/modules/owner/order-type/api/order-type.service"
import { CrudServiceError } from "@/shared/api/crud/types"
import { Input } from "@/shared/ui/input"
import { Switch } from "@/shared/ui/switch"

const ORDER_TYPE_META: Record<string, { label: string; icon: LucideIcon }> = {
  dine_in: { label: "Dine-in (Makan di Tempat)", icon: UtensilsIcon },
  takeaway: { label: "Takeaway (Bungkus)", icon: ShoppingBagIcon },
  delivery: { label: "Delivery (Pesan Antar)", icon: BikeIcon },
}

const QUERY_KEY = ["order-types"]

export function OrderTypeSection() {
  const queryClient = useQueryClient()
  const { data: orderTypes = [], isPending } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: listOrderTypes,
  })

  // Sort order is edited as free text before being committed on blur, so it
  // needs its own local draft state — everything else (the switch) commits
  // immediately and can read straight from the query cache.
  const [sortDrafts, setSortDrafts] = useState<Record<number, string>>({})

  useEffect(() => {
    setSortDrafts(
      Object.fromEntries(orderTypes.map((row) => [row.id ?? 0, String(row.sort_order ?? 0)]))
    )
  }, [orderTypes])

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { enabled: boolean; sort_order: number } }) =>
      updateOrderType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: (error) => {
      toast.error(error instanceof CrudServiceError ? error.message : "Gagal menyimpan perubahan")
    },
  })

  function commitSortOrder(row: OrderType) {
    const id = row.id ?? 0
    const draft = Number(sortDrafts[id])
    if (Number.isNaN(draft) || draft === row.sort_order) return
    mutation.mutate({ id, payload: { enabled: row.enabled ?? true, sort_order: draft } })
  }

  function toggleEnabled(row: OrderType, enabled: boolean) {
    mutation.mutate({ id: row.id ?? 0, payload: { enabled, sort_order: row.sort_order ?? 0 } })
  }

  return (
    <div className="flex flex-col gap-1 rounded-[18px] border bg-card px-6 py-6">
      <h1 className="text-xl font-bold text-foreground">Jenis Order</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Atur tipe order yang bisa dipilih kasir dan urutan tampilnya.
      </p>

      <div className="flex flex-col gap-3">
        {isPending && <p className="py-8 text-center text-sm text-muted-foreground">Memuat...</p>}

        {!isPending && orderTypes.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada jenis order.
          </p>
        )}

        {orderTypes.map((row) => {
          const meta = ORDER_TYPE_META[row.type ?? ""] ?? {
            label: row.type ?? "",
            icon: UtensilsIcon,
          }
          const Icon = meta.icon
          const id = row.id ?? 0
          return (
            <div
              key={id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm font-bold text-foreground">{meta.label}</p>
              </div>

              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  Urutan
                  <Input
                    type="number"
                    min={0}
                    className="w-16"
                    value={sortDrafts[id] ?? ""}
                    onChange={(event) =>
                      setSortDrafts((state) => ({ ...state, [id]: event.target.value }))
                    }
                    onBlur={() => commitSortOrder(row)}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Aktif</span>
                  <Switch
                    checked={row.enabled ?? false}
                    onCheckedChange={(checked) => toggleEnabled(row, checked)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
