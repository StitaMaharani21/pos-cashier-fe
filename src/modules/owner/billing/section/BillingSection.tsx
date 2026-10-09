import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { AddonList } from "@/modules/owner/billing/components/AddonList"
import { CurrentPlanSummaryCard } from "@/modules/owner/billing/components/CurrentPlanSummaryCard"
import { PaymentQrDialog } from "@/modules/owner/billing/components/PaymentQrDialog"
import { PlanComparisonGrid } from "@/modules/owner/billing/components/PlanComparisonGrid"
import {
  useAddonCatalog,
  useCurrentSubscription,
  useSubscriptionPlans,
} from "@/modules/owner/billing/api/subscription.queries"
import type { PaymentIntent } from "@/modules/owner/billing/lib/payment-intent"
import { DEVICE_QUOTA_KEY, getDeviceQuota } from "@/modules/owner/device/api/device.service"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/ui/page-header"

// /app/billing — "Paket & Addon". Not feature-gated (routeAccess.ts's
// "billing" entry is {}): every owner, on any plan, needs to be able to see
// this page to find out what to upgrade to — gating it would lock an owner
// out of the one page that explains how to unlock everything else.
//
// An owner can pay for an upgrade/renewal, the Laporan/Inventori add-ons and
// extra devices right here with QRIS (PaymentQrDialog). What the backend does
// not sell yet (an add-on without a price, Kasir Tambahan, overage,
// Enterprise) keeps the WhatsApp path every locked-feature CTA uses.
export function BillingSection() {
  const { caps, isLoading, refetch } = useCapabilities()
  const [intent, setIntent] = useState<PaymentIntent | null>(null)

  // Supplements: the page renders from capabilities alone when any of these
  // fail, falling back to the static price list and the WhatsApp buttons.
  const plans = useSubscriptionPlans()
  const current = useCurrentSubscription()
  const catalog = useAddonCatalog()
  const quota = useQuery({ queryKey: DEVICE_QUOTA_KEY, queryFn: getDeviceQuota, staleTime: 30_000, retry: false })

  if (isLoading || !caps) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Paket & Fitur Tambahan" description="Lihat paket dan fitur tambahan yang tersedia untuk toko Anda" />
        {isLoading ? (
          <div className="h-96 animate-pulse rounded-[18px] border bg-muted/40" />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[18px] border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">Gagal memuat informasi paket.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Coba Lagi
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Paket & Fitur Tambahan" description="Lihat dan beli paket serta fitur tambahan untuk toko Anda" />
      <CurrentPlanSummaryCard caps={caps} current={current.data} />
      <PlanComparisonGrid caps={caps} plans={plans.data} current={current.data} onBuy={setIntent} />
      <AddonList caps={caps} catalog={catalog.data} quota={quota.data} onBuy={setIntent} />
      <PaymentQrDialog intent={intent} onOpenChange={(open) => !open && setIntent(null)} />
    </div>
  )
}
