import type { CurrentSubscription } from "@/entities/subscription/model/subscription.types"
import { BILLING_ADDONS } from "@/modules/owner/billing/content/billingAddons"
import { formatDay } from "@/modules/owner/billing/lib/payment-intent"
import { PLANS } from "@/modules/public/landing/presentation/landing.content"
import type { Capabilities } from "@/shared/access/types"
import { Badge } from "@/shared/ui/badge"

// Plan display name comes from PLANS (same data PlanComparisonGrid renders)
// rather than a second hardcoded map, so this card and the grid below it
// never show two different names for the same plan.
function planName(plan: Capabilities["plan"]): string {
  return PLANS.find((p) => p.id === plan)?.name ?? plan
}

const ADDON_TITLES: Record<string, string> = {
  ...Object.fromEntries(BILLING_ADDONS.map((addon) => [addon.code, addon.title])),
  EXTRA_DEVICE: "Perangkat Tambahan",
}

interface CurrentPlanSummaryCardProps {
  caps: Capabilities
  // GET /subscriptions/current — adds the end dates and quantities. Without it
  // (request failed) the card still lists the active add-ons from capabilities.
  current?: CurrentSubscription
}

export function CurrentPlanSummaryCard({ caps, current }: CurrentPlanSummaryCardProps) {
  // Defensive against `addons` arriving as JSON null (see AddonCard.tsx).
  const capCodes = caps.addons ?? []
  const owned = current?.addons ?? capCodes.map((code) => ({ code, qty: 1, expires_at: undefined }))
  const renewAt = formatDay(current?.renew_at)

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border bg-card px-7 py-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-medium text-muted-foreground">Paket Anda Saat Ini</span>
        <Badge className="text-sm">{planName(caps.plan)}</Badge>
        {renewAt && <span className="text-xs text-muted-foreground">aktif sampai {renewAt}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {owned.length === 0 ? (
          <span className="text-sm text-muted-foreground">Belum ada fitur tambahan yang aktif.</span>
        ) : (
          owned.map((addon, index) => {
            const title = ADDON_TITLES[addon.code] ?? "Fitur tambahan"
            const until = formatDay(addon.expires_at)
            return (
              <Badge key={`${addon.code}-${index}`} variant="secondary">
                {title}
                {addon.qty > 1 ? ` ×${addon.qty}` : ""} aktif{until ? ` sampai ${until}` : ""}
              </Badge>
            )
          })
        )}
      </div>
    </div>
  )
}
