import { AddonCard } from "@/modules/owner/billing/components/AddonCard"
import { BILLING_ADDONS } from "@/modules/owner/billing/content/billingAddons"
import { waLink } from "@/modules/public/shared/contact"
import { EXTRA_PRICING } from "@/modules/public/shared/pricing"
import type { Capabilities } from "@/shared/access/types"

// Paid extras from the price list. Unlike the add-ons above they are not
// switched on from caps.addons — sales sets them up by hand — so they render
// as plain rows with a WhatsApp CTA instead of an Aktif/locked badge.
const PRICED_EXTRAS = [
  {
    ...EXTRA_PRICING.extraDevice,
    message: "Halo Neela, saya ingin menambah device untuk toko saya.",
  },
  {
    ...EXTRA_PRICING.overage,
    message: "Halo Neela, saya ingin tanya soal overage transaksi.",
  },
]

export function AddonList({ caps }: { caps: Capabilities }) {
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
          <AddonCard key={addon.code} addon={addon} caps={caps} />
        ))}
      </div>

      <div className="mt-2">
        <h2 className="text-lg font-bold text-foreground">Tambahan Berbayar Lainnya</h2>
        <p className="text-sm text-muted-foreground">
          Harga per toko, belum termasuk PPN (jika berlaku). Diaktifkan oleh tim Neela.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {PRICED_EXTRAS.map((extra) => (
          <div
            key={extra.title}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border bg-card px-6 py-5"
          >
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{extra.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{extra.description}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {extra.price}
                <span className="font-normal text-muted-foreground"> {extra.unit}</span>
              </p>
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
