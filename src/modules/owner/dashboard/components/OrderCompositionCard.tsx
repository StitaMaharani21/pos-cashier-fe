import { BikeIcon, ShoppingBagIcon, UtensilsIcon, type LucideIcon } from "lucide-react"

import { useOrderComposition } from "@/modules/owner/dashboard/dashboard.queries"

const ORDER_TYPE_META: Record<string, { label: string; icon: LucideIcon }> = {
  dine_in: { label: "Dine-in (Makan di Tempat)", icon: UtensilsIcon },
  takeaway: { label: "Takeaway (Bungkus)", icon: ShoppingBagIcon },
  delivery: { label: "Delivery Apps (GoFood, GrabFood)", icon: BikeIcon },
}

export function OrderCompositionCard() {
  const { data, isPending } = useOrderComposition()
  const items = data?.items ?? []

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Komposisi Order</h2>
        <span className="rounded-full bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
          Total: {data?.total ?? 0} pesanan
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3">
        {isPending && <p className="py-8 text-center text-sm text-muted-foreground">Memuat...</p>}

        {!isPending && items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada order hari ini.
          </p>
        )}

        {items.map((item, index) => {
          const orderType = item.order_type ?? ""
          const meta = ORDER_TYPE_META[orderType] ?? {
            label: orderType,
            icon: UtensilsIcon,
          }
          const Icon = meta.icon
          return (
            <div
              key={orderType || index}
              className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{meta.label}</p>
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
