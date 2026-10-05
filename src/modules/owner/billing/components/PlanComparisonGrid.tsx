import { CircleCheck } from "lucide-react"

import { PLANS, type Plan } from "@/modules/public/landing/presentation/landing.content"
import { ownerPlanInquiryMessage, waLink } from "@/modules/public/shared/contact"
import type { Capabilities } from "@/shared/access/types"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

const PLAN_RANK: Record<Plan["id"], number> = { starter: 0, pro: 1, enterprise: 2 }

// Reuses PLANS (the same data PricingSection's marketing cards render) but
// deliberately does NOT reuse PlanCard/PlanCtaLink: those use public-page
// (neela-*) design tokens nothing else in /app uses, carry a monthly/annual
// toggle this discovery page doesn't need, and route through an
// isOwner-detection heuristic built for visitors — inside /app the viewer is
// always the owner, so the CTA here always goes straight to WhatsApp.
export function PlanComparisonGrid({ caps }: { caps: Capabilities }) {
  const currentRank = PLAN_RANK[caps.plan]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Perbandingan Paket</h2>
        <p className="text-sm text-muted-foreground">Harga per toko per bulan, belum termasuk PPN (jika berlaku).</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const rank = PLAN_RANK[plan.id]
          const isCurrent = rank === currentRank
          const isBelowCurrent = rank < currentRank

          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col gap-4 rounded-[18px] border bg-card p-6",
                isCurrent && "border-primary ring-1 ring-primary"
              )}
            >
              <div>
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-foreground">
                  {plan.pricePrefix}
                  {plan.price.monthly}
                </span>
                <span className="text-sm text-muted-foreground">/bulan</span>
                <p className="mt-0.5 text-xs text-muted-foreground">{plan.subtext.monthly}</p>
              </div>

              <div className="flex flex-col gap-2">
                {plan.includesPrevious && (
                  <p className="text-xs font-semibold text-foreground">{plan.includesPrevious}</p>
                )}
                <ul className="flex flex-col gap-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.note && <p className="text-xs text-muted-foreground italic">{plan.note}</p>}
              </div>

              <div className="mt-auto pt-2">
                {isCurrent ? (
                  <Badge className="w-full justify-center py-1.5 text-sm">Paket Anda Saat Ini</Badge>
                ) : isBelowCurrent ? (
                  <Badge variant="secondary" className="w-full justify-center py-1.5 text-sm">
                    Termasuk di paket Anda
                  </Badge>
                ) : (
                  <a
                    href={waLink(ownerPlanInquiryMessage(plan.name))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {plan.ownerCta ?? plan.cta}
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
