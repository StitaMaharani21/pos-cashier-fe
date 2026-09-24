import { LockIcon } from "lucide-react"

import { Button } from "@/shared/ui/button"

import { contactLink, featureCopy, hintCopy } from "./upsellContent"
import { useCapabilities } from "./useCapabilities"
import type { Feature } from "./types"

interface LockedPageProps {
  feature: Feature
}

// Shown when an owner opens a locked feature's URL directly, instead of
// clicking through the sidebar (which would open UpsellModal instead).
export function LockedPage({ feature }: LockedPageProps) {
  const { upgradeHint } = useCapabilities()
  const hint = upgradeHint(feature)
  const copy = featureCopy[feature]
  const link = contactLink(feature, hint)

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LockIcon className="size-6" />
      </span>
      <div>
        <span className="text-xs font-medium text-primary">{hintCopy[hint].badge}</span>
        <h1 className="mt-1 text-xl font-semibold">{copy?.title ?? feature}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{copy?.description}</p>
      </div>
      {link && (
        <Button asChild>
          <a href={link} target="_blank" rel="noreferrer">
            {hintCopy[hint].cta}
          </a>
        </Button>
      )}
    </div>
  )
}
