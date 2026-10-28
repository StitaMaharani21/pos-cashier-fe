import type { ReactNode } from "react"
import { BadgeCheck, CheckIcon, Info } from "lucide-react"
import { Link } from "react-router-dom"

import type { LandingContent, LandingPlan } from "@/modules/public/landing/application/landing-content"
import { SectionHeading } from "@/modules/public/landing/presentation/components/SectionHeading"
import { fillTemplate } from "@/modules/public/shared/cms/cms.reader"
import { REGISTER_PATH, waLink } from "@/modules/public/shared/contact"
import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"
import { cn } from "@/shared/lib/utils"

interface PlanCtaLinkProps {
  plan: LandingPlan
  content: LandingContent
  isOwner: boolean
  className: string
  children: ReactNode
}

// Visitors on a "register" plan go to the registration page with that plan
// pre-picked (?paket=); an owner who already has a store is sent to sales
// instead (upgrades aren't self-serve), and "sales" plans (Enterprise)
// always open WhatsApp.
function PlanCtaLink({ plan, content, isOwner, className, children }: PlanCtaLinkProps) {
  if (plan.ctaAction === "register" && !isOwner) {
    return (
      <Link to={`${REGISTER_PATH}?paket=${plan.id}`} className={className}>
        {children}
      </Link>
    )
  }
  const { wa } = content.global
  const message = fillTemplate(isOwner ? wa.ownerPlan : wa.plan, { plan_name: plan.name })
  return (
    <a href={waLink(message, content.settings.salesWa)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function PlanCard({ plan, content, isOwner }: { plan: LandingPlan; content: LandingContent; isOwner: boolean }) {
  const featured = plan.highlighted

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between gap-7 rounded-2xl bg-white p-7",
        featured ? "border-2 border-neela-brand shadow-lg" : "border border-neela-border"
      )}
    >
      {featured && (
        <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-neela-brand px-3 py-1 text-[11px] font-bold tracking-wide text-white">
          {content.pricing.highlightBadge}
        </span>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <span className="text-neela-label-lg font-bold text-neela-text">{plan.name}</span>
          <p className="mt-1 text-neela-body-sm text-neela-text-secondary">{plan.description}</p>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            {plan.pricePrefix && (
              <span className="text-neela-body-md font-medium text-neela-text-secondary">{plan.pricePrefix}</span>
            )}
            <span className="text-neela-headline-xl-mobile font-bold text-neela-text md:text-neela-headline-xl">
              {plan.price}
            </span>
            <span className="text-neela-body-sm text-neela-text-secondary">{content.pricing.perMonth}</span>
          </div>
          <p className="mt-1 text-neela-body-sm text-neela-text-secondary">
            {plan.cashiers} &middot; {plan.devices}
          </p>
        </div>

        <ul className="flex flex-col gap-2.5 pt-1 text-neela-body-md text-neela-text">
          {plan.includesPrevious && (
            <li className="flex items-center gap-2 font-semibold text-neela-brand">
              <BadgeCheck className="size-[18px] shrink-0" aria-hidden />
              <span>{plan.includesPrevious}</span>
            </li>
          )}
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckIcon className="mt-px size-[18px] shrink-0 text-neela-brand" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {plan.note && (
          <p className="flex items-start gap-2 rounded-xl bg-neela-surface-alt p-3 text-neela-body-sm text-neela-text-secondary">
            <Info className="mt-px size-4 shrink-0 text-neela-text-muted" aria-hidden />
            <span>{plan.note}</span>
          </p>
        )}
      </div>

      <PlanCtaLink
        plan={plan}
        content={content}
        isOwner={isOwner}
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-lg text-center text-neela-label-md font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neela-brand focus-visible:ring-offset-2",
          featured
            ? "bg-neela-brand text-white hover:bg-neela-primary-hover"
            : "border border-neela-border bg-white text-neela-text hover:bg-neela-surface-alt"
        )}
      >
        {isOwner && plan.ownerCta ? plan.ownerCta : plan.cta}
      </PlanCtaLink>
    </div>
  )
}

export function PricingSection() {
  const isOwner = useIsOwnerSession()
  const content = useLandingContent()
  const { pricing } = content

  return (
    <section id="harga" className="w-full scroll-mt-18 bg-neela-surface-alt py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-14 px-4 md:px-6 lg:px-8">
        <SectionHeading
          className="max-w-xl"
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          description={pricing.description}
        />

        <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {pricing.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} content={content} isOwner={isOwner} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center text-neela-body-sm text-neela-text-secondary">
          <p>{pricing.extraNote}</p>
          <p>{pricing.terms}</p>
        </div>
      </div>
    </section>
  )
}
