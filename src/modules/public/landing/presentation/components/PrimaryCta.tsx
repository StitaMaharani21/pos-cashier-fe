import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { PRIMARY_CTA } from "@/modules/public/landing/presentation/landing.content"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

interface PrimaryCtaProps {
  className: string
  withArrow?: boolean
}

// "Daftar Early Access" → /daftar for visitors; "Buka Dashboard" → /app once
// an owner session exists, so a logged-in owner is never told to sign up.
export function PrimaryCta({ className, withArrow = false }: PrimaryCtaProps) {
  const isOwner = useIsOwnerSession()
  const cta = isOwner ? PRIMARY_CTA.owner : PRIMARY_CTA.visitor

  return (
    <Link to={cta.to} className={className}>
      <span>{cta.label}</span>
      {withArrow && <ArrowRight className="size-5" />}
    </Link>
  )
}
