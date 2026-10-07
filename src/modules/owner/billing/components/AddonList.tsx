import type { AddonCatalogItem, DeviceQuota } from "@/entities/subscription/model/subscription.types"
import { AddonCard } from "@/modules/owner/billing/components/AddonCard"
import { DeviceAddonCard } from "@/modules/owner/billing/components/DeviceAddonCard"
import { BILLING_ADDONS } from "@/modules/owner/billing/content/billingAddons"
import type { PaymentIntent } from "@/modules/owner/billing/lib/payment-intent"
import { waLink } from "@/modules/public/shared/contact"
import { EXTRA_PRICING } from "@/modules/public/shared/pricing"
import type { Capabilities } from "@/shared/access/types"

const EXTRA_DEVICE = "EXTRA_DEVICE"

// Paid extras from the price list that are still set up by hand (no checkout):
// overage is billed at month end by sales, and Device Tambahan only until the
// backend sells it (see below). They render as plain rows with a WhatsApp CTA.
const MANUAL_EXTRAS = [
  {
    key: "device",
    ...EXTRA_PRICING.extraDevice,
    message: "Halo Neela, saya ingin menambah device untuk toko saya.",
  },
  {
    key: "overage",
    ...EXTRA_PRICING.overage,
    message: "Halo Neela, saya ingin tanya soal overage transaksi.",
  },
]

interface AddonListProps {
  caps: Capabilities
  // GET /subscriptions/addons and GET /devices/quota; undefined while loading or
  // when the request failed — every card then falls back to WhatsApp.
  catalog?: AddonCatalogItem[]
  quota?: DeviceQuota
  onBuy: (intent: PaymentIntent) => void
}

export function AddonList({ caps, catalog, quota, onBuy }: AddonListProps) {
  const deviceItem = catalog?.find((item) => item.code === EXTRA_DEVICE)
  // Sold by the backend → the quantity card; otherwise the static price row.
  const deviceForSale = deviceItem?.purchasable === true

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Add-on</h2>
        <p className="text-sm text-muted-foreground">
          Nyalakan satu fitur tambahan tanpa upgrade paket penuh.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {BILLING_ADDONS.map((addon) => (
          <AddonCard
            key={addon.code}
            addon={addon}
            caps={caps}
            catalogItem={catalog?.find((item) => item.code === addon.code)}
            onBuy={onBuy}
          />
        ))}
      </div>

      <div className="mt-2">
        <h2 className="text-lg font-bold text-foreground">Tambahan Berbayar Lainnya</h2>
        <p className="text-sm text-muted-foreground">
          Harga per toko, belum termasuk PPN (jika berlaku).
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {deviceForSale && deviceItem && <DeviceAddonCard item={deviceItem} quota={quota} onBuy={onBuy} />}
        {MANUAL_EXTRAS.filter((extra) => !(extra.key === "device" && deviceForSale)).map((extra) => (
          <div
            key={extra.key}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border bg-card px-6 py-5"
          >
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{extra.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{extra.description}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {extra.price}
                <span className="font-normal text-muted-foreground"> {extra.unit}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Diaktifkan oleh tim Neela.</p>
            </div>
            <a
              href={waLink(extra.message)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Tanya Tim Neela
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
