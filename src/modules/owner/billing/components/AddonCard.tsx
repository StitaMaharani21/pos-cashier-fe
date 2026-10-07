import type { AddonCatalogItem } from "@/entities/subscription/model/subscription.types"
import type { BillingAddon } from "@/modules/owner/billing/content/billingAddons"
import { formatDay, type PaymentIntent } from "@/modules/owner/billing/lib/payment-intent"
import { waLink } from "@/modules/public/shared/contact"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { contactLink, hintCopy } from "@/shared/access/upsellContent"
import type { Capabilities } from "@/shared/access/types"
import { formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

interface AddonCardProps {
  addon: BillingAddon
  caps: Capabilities
  // This add-on's row in GET /subscriptions/addons, when the backend sells it
  // (and the request worked). Without it the card is the WhatsApp card it was.
  catalogItem?: AddonCatalogItem
  onBuy: (intent: PaymentIntent) => void
}

// One row per add-on. Active state reads straight from caps.addons (the one
// check that works identically for all codes, including EXTRA_CASHIER which
// has no Feature to check via featureState()).
//
// Three ways the CTA goes:
//   - the backend sells it (catalogItem.purchasable): Beli / Perpanjang → QRIS;
//   - it is already part of the plan or permanently granted: just a badge;
//   - otherwise (not priced yet, EXTRA_CASHIER): the WhatsApp flow every other
//     locked-feature CTA uses — contactLink()/hintCopy, byte-for-byte.
export function AddonCard({ addon, caps, catalogItem, onBuy }: AddonCardProps) {
  const { upgradeHint } = useCapabilities()
  // Defensive: pos-kasir-be's GET /me/capabilities can render `addons` as
  // JSON null for a store with zero active addons (a nil-slice-to-JSON
  // gotcha, fixed at the source in entitlement.Build — kept here too since
  // this page was the first place caps.addons was ever read directly).
  const isActive = (caps.addons ?? []).includes(addon.code) || (catalogItem?.owned_qty ?? 0) > 0
  const included = catalogItem?.included_in_plan === true
  const purchasable = catalogItem?.purchasable === true

  let badgeLabel = "Aktif"
  let ctaLabel: string | undefined
  let href: string | undefined

  if (included) {
    badgeLabel = "Termasuk di paket Anda"
  } else if (!isActive && !purchasable) {
    if (addon.feature) {
      const hint = upgradeHint(addon.feature)
      badgeLabel = hintCopy[hint].badge
      ctaLabel = hintCopy[hint].cta
      href = contactLink(addon.feature, hint)
    } else {
      // EXTRA_CASHIER: no Feature/upgrade_hint exists on the backend for
      // this one (see billingAddons.ts) — same situation OrderSourceTab's
      // plan-only gate handles with a local WhatsApp link.
      badgeLabel = hintCopy.ADDON.badge
      ctaLabel = hintCopy.ADDON.cta
      href = waLink("Halo Neela, saya ingin menambah kuota akun kasir.")
    }
  } else if (!isActive) {
    badgeLabel = hintCopy.ADDON.badge
  }

  const until = formatDay(catalogItem?.active_until)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border bg-card px-6 py-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{addon.title}</p>
          <Badge variant={isActive || included ? "default" : "outline"}>{badgeLabel}</Badge>
        </div>
        {addon.description && (
          <p className="mt-1 text-sm text-muted-foreground">{addon.description}</p>
        )}
        {purchasable && catalogItem && (
          <p className="mt-1 text-sm font-semibold text-foreground">
            {formatRupiah(catalogItem.price)}
            <span className="font-normal text-muted-foreground"> / {catalogItem.duration_days} hari</span>
          </p>
        )}
        {isActive && until && <p className="mt-1 text-xs text-muted-foreground">Aktif sampai {until}</p>}
        {isActive && catalogItem?.permanent && (
          <p className="mt-1 text-xs text-muted-foreground">Aktif tanpa batas waktu.</p>
        )}
        {/* Not sold yet — sales quotes it. */}
        {!isActive && !included && !purchasable && (
          <p className="mt-1 text-xs text-muted-foreground">Harga: hubungi tim Neela</p>
        )}
      </div>
      {purchasable && catalogItem ? (
        <Button
          className="h-9 shrink-0"
          variant={isActive ? "outline" : "default"}
          onClick={() => onBuy({ kind: "addon", addon: catalogItem, qty: 1 })}
        >
          {isActive ? "Perpanjang" : "Beli"}
        </Button>
      ) : (
        !isActive &&
        !included &&
        href &&
        ctaLabel && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {ctaLabel}
          </a>
        )
      )}
    </div>
  )
}
