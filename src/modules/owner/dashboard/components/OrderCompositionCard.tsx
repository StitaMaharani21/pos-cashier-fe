import { BikeIcon, ShoppingBagIcon, UtensilsIcon, type LucideIcon } from "lucide-react"

import { useOrderComposition } from "@/modules/owner/dashboard/dashboard.queries"
import { orderTypeLabel } from "@/shared/lib/order-type-label"

const ORDER_TYPE_ICON: Record<string, LucideIcon> = {
  dine_in: UtensilsIcon,
  takeaway: ShoppingBagIcon,
  delivery: BikeIcon,
}

export function OrderCompositionCard() {
  const { data, isPending } = useOrderComposition()
  const items = data?.items ?? []

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Jenis Pesanan Hari Ini</h2>
        <span className="rounded-full bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
          Total: {data?.total ?? 0} pesanan
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3">
        {isPending &&
          Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-18 animate-pulse rounded-xl bg-muted" />
          ))}

        {!isPending && items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada pesanan hari ini.
          </p>
        )}

        {items.map((item, index) => {
          const orderType = item.order_type ?? ""
          const Icon = ORDER_TYPE_ICON[orderType] ?? UtensilsIcon
          return (
            <div
              key={orderType || index}
              className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-strong">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{orderTypeLabel(orderType)}</p>
                <p className="text-[13px] text-muted-foreground">
                  {item.count ?? 0} Pesanan • {(item.percent ?? 0).toFixed(0)}%
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
