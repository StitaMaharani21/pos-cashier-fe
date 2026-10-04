import { BILLING_ADDONS } from "@/modules/owner/billing/content/billingAddons"
import { PLANS } from "@/modules/public/landing/presentation/landing.content"
import type { Capabilities } from "@/shared/access/types"
import { Badge } from "@/shared/ui/badge"

// Plan display name comes from PLANS (same data PlanComparisonGrid renders)
// rather than a second hardcoded map, so this card and the grid below it
// never show two different names for the same plan.
function planName(plan: Capabilities["plan"]): string {
  return PLANS.find((p) => p.id === plan)?.name ?? plan
}

export function CurrentPlanSummaryCard({ caps }: { caps: Capabilities }) {
  // Defensive against `addons` arriving as JSON null (see AddonCard.tsx).
  const activeAddons = BILLING_ADDONS.filter((addon) => (caps.addons ?? []).includes(addon.code))

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border bg-card px-7 py-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-medium text-muted-foreground">Paket Anda Saat Ini</span>
        <Badge className="text-sm">{planName(caps.plan)}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {activeAddons.length === 0 ? (
          <span className="text-sm text-muted-foreground">Belum ada add-on aktif.</span>
        ) : (
          activeAddons.map((addon) => (
            <Badge key={addon.code} variant="secondary">
              {addon.title} aktif
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}
