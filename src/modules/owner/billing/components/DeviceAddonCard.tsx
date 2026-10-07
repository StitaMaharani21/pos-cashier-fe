import { useState } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import type { AddonCatalogItem, DeviceQuota } from "@/entities/subscription/model/subscription.types"
import { formatDay, type PaymentIntent } from "@/modules/owner/billing/lib/payment-intent"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

const MAX_QTY = 10

interface DeviceAddonCardProps {
  item: AddonCatalogItem
  quota?: DeviceQuota
  onBuy: (intent: PaymentIntent) => void
}

// "Device Tambahan": extra cashier devices on top of the plan's allowance
// (Starter 2, Pro 4). Sold per unit, so the owner picks how many; the price
// and the allowance both come from the backend.
export function DeviceAddonCard({ item, quota, onBuy }: DeviceAddonCardProps) {
  const [qty, setQty] = useState(1)
  const until = formatDay(item.active_until)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border bg-card px-6 py-5">
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tablet kasir atau admin tambahan di luar jumlah device paket Anda.
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {formatRupiah(item.price)}
          <span className="font-normal text-muted-foreground"> / device / {item.duration_days} hari</span>
        </p>
        {quota && (
          <p className="mt-1 text-xs text-muted-foreground">
            {quota.unlimited
              ? `${quota.used} perangkat terhubung · tanpa batas`
              : `${quota.used} dari ${quota.limit} perangkat terpakai`}
            {item.owned_qty > 0 ? ` · ${item.owned_qty} device tambahan aktif${until ? ` sampai ${until}` : ""}` : ""}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border p-1" role="group" aria-label="Jumlah device">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Kurangi"
            disabled={qty <= 1}
            onClick={() => setQty((value) => Math.max(1, value - 1))}
          >
            <MinusIcon />
          </Button>
          <span className="min-w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Tambah"
            disabled={qty >= MAX_QTY}
            onClick={() => setQty((value) => Math.min(MAX_QTY, value + 1))}
          >
            <PlusIcon />
          </Button>
        </div>
        <Button className="h-9" onClick={() => onBuy({ kind: "addon", addon: item, qty })}>
          Beli · {formatRupiah(item.price * qty)}
        </Button>
      </div>
    </div>
  )
}
