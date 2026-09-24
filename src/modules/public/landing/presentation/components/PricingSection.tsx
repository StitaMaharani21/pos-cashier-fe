import { useState, type ReactNode } from "react"
import { BadgeCheck, CircleCheck, Info, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import {
  PLANS,
  PRICING_FOOTNOTE,
  type BillingCycle,
  type Plan,
} from "@/modules/public/landing/presentation/landing.content"
import { REGISTER_PATH, waLink } from "@/modules/public/shared/contact"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"
import { cn } from "@/shared/lib/utils"

const TOGGLE_BASE = "flex items-center gap-1.5 rounded-full px-4 py-2 text-neela-label-md transition-all"
const TOGGLE_ACTIVE = "bg-neela-surface-container-lowest text-neela-on-surface shadow-sm"
const TOGGLE_IDLE = "text-neela-on-surface-variant hover:text-neela-on-surface"

interface PlanCtaLinkProps {
  plan: Plan
  isOwner: boolean
  className: string
  children: ReactNode
}

// Visitors on a "register" plan go to the registration page with that plan
// pre-picked (?paket=, which falls back to Starter while it's the only
// selectable one); an owner who already has a store is sent to sales
// instead (upgrades aren't self-serve), and "sales" plans (Enterprise)
// always open WhatsApp.
function PlanCtaLink({ plan, isOwner, className, children }: PlanCtaLinkProps) {
  if (plan.ctaAction === "register" && !isOwner) {
    return (
      <Link to={`${REGISTER_PATH}?paket=${plan.id}`} className={className}>
        {children}
      </Link>
    )
  }
  const message = isOwner
    ? `Halo Neela POS, saya pemilik toko dan ingin tanya soal paket ${plan.name}`
    : `Halo Neela POS, saya ingin konsultasi paket ${plan.name}`
  return (
    <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function PlanCard({ plan, cycle, isOwner }: { plan: Plan; cycle: BillingCycle; isOwner: boolean }) {
  const featured = plan.id === "pro"
  const enterprise = plan.id === "enterprise"
  const ctaClassName = cn(
    "w-full rounded-xl px-4 text-center text-neela-label-md font-bold transition-all",
    enterprise
      ? "bg-neela-on-primary-fixed py-3 text-neela-primary-fixed hover:bg-neela-primary"
      : "bg-neela-primary-container py-3.5 text-neela-on-primary shadow-lg shadow-neela-primary-container/30 hover:bg-neela-primary active:scale-[0.98]"
  )

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-neela-surface-container-lowest p-8",
        featured ? "shadow-2xl ring-2 ring-neela-primary-container" : "shadow-md"
      )}
    >
      {featured && plan.badge && (
        <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1 text-[11px] font-bold tracking-wide text-neela-on-primary shadow-sm">
          {plan.badge}
        </div>
      )}

      <div className={cn("flex flex-col gap-4", featured && "pt-2")}>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span
              className={
                featured
                  ? "text-neela-headline-sm font-bold text-neela-primary"
                  : "text-neela-label-lg font-bold text-neela-on-surface"
              }
            >
              {plan.name}
            </span>
            {!featured && plan.badge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  enterprise
                    ? "bg-purple-100 text-purple-700"
                    : "bg-neela-tertiary-container/15 text-neela-tertiary"
                )}
              >
                {plan.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-neela-body-sm text-neela-on-surface-variant">{plan.description}</p>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-neela-headline-xl-mobile font-bold text-neela-on-surface md:text-neela-headline-xl">
              {plan.price[cycle]}
            </span>
            <span className="text-neela-body-sm text-neela-on-surface-variant">/ outlet / bln</span>
          </div>
          <p className="mt-1 text-neela-body-sm text-neela-outline">{plan.subtext[cycle]}</p>
        </div>

        <ul className="flex flex-col gap-2.5 pt-2 text-neela-body-md text-neela-on-surface">
          {plan.includesPrevious && (
            <li
              className={cn(
                "flex items-center gap-2 font-semibold",
                featured ? "text-neela-primary" : "text-neela-on-surface-variant"
              )}
            >
              <BadgeCheck
                className={cn(
                  "size-[18px] shrink-0 text-neela-surface-container-lowest",
                  featured ? "fill-neela-primary-container" : "fill-purple-600"
                )}
              />
              <span>{plan.includesPrevious}</span>
            </li>
          )}
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CircleCheck className="mt-px size-[18px] shrink-0 fill-neela-tertiary text-neela-surface-container-lowest" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {plan.note && (
          <p className="flex items-start gap-2 rounded-xl bg-neela-surface-container-low p-3 text-neela-body-sm text-neela-on-surface-variant">
            <Info className="mt-px size-4 shrink-0 text-neela-secondary" />
            <span>{plan.note}</span>
          </p>
        )}
      </div>

      <PlanCtaLink plan={plan} isOwner={isOwner} className={ctaClassName}>
        {isOwner && plan.ownerCta ? plan.ownerCta : plan.cta}
      </PlanCtaLink>
    </div>
  )
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly")
  const isOwner = useIsOwnerSession()

  return (
    <section id="harga" className="w-full scroll-mt-20 bg-neela-surface-container-low py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 px-4 md:px-6 lg:px-8">
        <SectionHeading
          className="max-w-xl"
          eyebrow="Paket Langganan"
          title="Harga Transparan, Tanpa Biaya Tersembunyi"
          description="Coba gratis 14 hari di paket Starter."
        />

        <div
          role="radiogroup"
          aria-label="Siklus tagihan"
          className="flex items-center gap-3 rounded-full bg-neela-surface-container-high p-1.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
            className={cn(TOGGLE_BASE, cycle === "monthly" ? TOGGLE_ACTIVE : TOGGLE_IDLE)}
          >
            Tagihan Bulanan
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={cycle === "annual"}
            onClick={() => setCycle("annual")}
            className={cn(TOGGLE_BASE, cycle === "annual" ? TOGGLE_ACTIVE : TOGGLE_IDLE)}
          >
            <span>Tagihan Tahunan</span>
            <span className="rounded-full bg-neela-tertiary px-2 py-0.5 text-[11px] font-bold text-neela-on-tertiary">
              Hemat 20%
            </span>
          </button>
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} isOwner={isOwner} />
          ))}
        </div>

        <div className="flex items-center gap-2 text-neela-body-sm text-neela-on-surface-variant">
          <ShieldCheck className="size-5 shrink-0 text-neela-tertiary" />
          <span>{PRICING_FOOTNOTE}</span>
        </div>
      </div>
    </section>
  )
}
