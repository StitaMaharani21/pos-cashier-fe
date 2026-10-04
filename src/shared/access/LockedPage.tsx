import { contactLink, featureCopy, hintCopy } from "./upsellContent"
import { LockedTile } from "./LockedTile"
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
    <LockedTile
      badge={hintCopy[hint].badge}
      title={copy?.title ?? feature}
      description={copy?.description}
      cta={link ? hintCopy[hint].cta : undefined}
      href={link}
    />
  )
}
