import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { useLandingContent } from "@/modules/public/landing/application/useLandingContent"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"

interface PrimaryCtaProps {
  className: string
  withArrow?: boolean
}

// "Daftar" → /daftar for visitors; "Buka Dashboard" → /app once an owner
// session exists, so a logged-in owner is never told to sign up.
export function PrimaryCta({ className, withArrow = false }: PrimaryCtaProps) {
  const isOwner = useIsOwnerSession()
  const { primaryCta } = useLandingContent().global
  const cta = isOwner ? primaryCta.owner : primaryCta.visitor

  return (
    <Link to={cta.to} className={className}>
      <span>{cta.label}</span>
      {withArrow && <ArrowRight className="size-5" aria-hidden />}
    </Link>
  )
}
