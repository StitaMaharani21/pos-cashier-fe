import type { BillingAddon } from "@/modules/owner/billing/content/billingAddons"
import { waLink } from "@/modules/public/shared/contact"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { contactLink, hintCopy } from "@/shared/access/upsellContent"
import type { Capabilities } from "@/shared/access/types"
import { Badge } from "@/shared/ui/badge"

interface AddonCardProps {
  addon: BillingAddon
  caps: Capabilities
}

// One row per add-on. Active state reads straight from caps.addons (the one
// check that works identically for all 3 codes, including EXTRA_CASHIER
// which has no Feature to check via featureState()). The CTA link/text is
// byte-for-byte the same contactLink()/hintCopy output an owner would get
// clicking the sidebar lock icon for the same feature — this page is a
// better front door to the same WhatsApp flow, not a different one.
export function AddonCard({ addon, caps }: AddonCardProps) {
  const { upgradeHint } = useCapabilities()
  // Defensive: pos-kasir-be's GET /me/capabilities can render `addons` as
  // JSON null for a store with zero active addons (a nil-slice-to-JSON
  // gotcha, fixed at the source in entitlement.Build — kept here too since
  // this page was the first place caps.addons was ever read directly).
  const isActive = (caps.addons ?? []).includes(addon.code)

  let badgeLabel = "Aktif"
  let ctaLabel: string | undefined
  let href: string | undefined

  if (!isActive) {
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
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border bg-card px-6 py-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{addon.title}</p>
          <Badge variant={isActive ? "default" : "outline"}>{badgeLabel}</Badge>
        </div>
        {addon.description && (
          <p className="mt-1 text-sm text-muted-foreground">{addon.description}</p>
        )}
        {/* These 3 add-ons have no published price yet — sales quotes them. */}
        {!isActive && (
          <p className="mt-1 text-xs text-muted-foreground">Harga: hubungi tim Neela</p>
        )}
      </div>
      {!isActive && href && ctaLabel && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {ctaLabel}
        </a>
      )}
    </div>
  )
}
