import { AddonList } from "@/modules/owner/billing/components/AddonList"
import { CurrentPlanSummaryCard } from "@/modules/owner/billing/components/CurrentPlanSummaryCard"
import { PlanComparisonGrid } from "@/modules/owner/billing/components/PlanComparisonGrid"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/ui/page-header"

// /app/billing — "Paket & Addon". Not feature-gated (routeAccess.ts's
// "billing" entry is {}): every owner, on any plan, needs to be able to see
// this page to find out what to upgrade to — gating it would lock an owner
// out of the one page that explains how to unlock everything else.
//
// Pure read-only discovery page: no mutation, no payment flow. Every CTA
// here reuses the exact same contactLink()/waLink() WhatsApp mechanism the
// sidebar lock icons and LockedPage/UpsellModal already use — this page
// just makes that existing path easier to find and compare up front,
// instead of only reacting to a lock an owner happens to hit.
export function BillingSection() {
  const { caps, isLoading, refetch } = useCapabilities()

  if (isLoading || !caps) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Paket & Addon" description="Lihat paket dan add-on yang tersedia untuk toko Anda" />
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
      <PageHeader title="Paket & Addon" description="Lihat paket dan add-on yang tersedia untuk toko Anda" />
      <CurrentPlanSummaryCard caps={caps} />
      <PlanComparisonGrid caps={caps} />
      <AddonList caps={caps} />
    </div>
  )
}
