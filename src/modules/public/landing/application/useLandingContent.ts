import { useMemo } from "react"

import { buildLandingContent, type LandingContent } from "@/modules/public/landing/application/landing-content"
import { useCmsSnapshot } from "@/modules/public/shared/cms/useCmsSnapshot"

// The landing page's content: the published CMS snapshot merged over the static
// defaults (see landing-content.ts). Always returns a complete object, so the
// sections render immediately and never need a loading or error state.
export function useLandingContent(): LandingContent {
  const snapshot = useCmsSnapshot()
  return useMemo(() => buildLandingContent(snapshot), [snapshot])
}
