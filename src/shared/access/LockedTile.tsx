import { LockIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

interface LockedTileProps {
  badge: string
  title: string
  description?: string
  cta?: string
  href?: string
  className?: string
}

// The locked/upsell tile itself — extracted out of LockedPage so a tab body
// (e.g. financial-report's Pro-only "Sumber Order") can show the same
// locked look scoped to just its own content div, instead of LockedPage's
// full-page treatment. Takes plain copy rather than a Feature so callers
// gating on something other than entitlement.Feature (e.g. a plan-only
// check with no corresponding backend feature flag) can still reuse it.
export function LockedTile({ badge, title, description, cta, href, className }: LockedTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card py-24 text-center",
        className
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LockIcon className="size-6" />
      </span>
      <div>
        <span className="text-xs font-medium text-primary">{badge}</span>
        <p className="mt-1 text-xl font-semibold text-foreground">{title}</p>
        {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && cta && (
        <Button asChild>
          <a href={href} target="_blank" rel="noreferrer">
            {cta}
          </a>
        </Button>
      )}
      {/* Secondary, always-present path to the full plan/addon comparison —
          kept visually quiet so the WhatsApp CTA above stays the fast path
          for someone who already knows what they want. */}
      <Link
        to="/app/billing"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Lihat semua paket & addon
      </Link>
    </div>
  )
}
