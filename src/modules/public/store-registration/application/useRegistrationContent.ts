import { useMemo } from "react"

import { useCmsSnapshot } from "@/modules/public/shared/cms/useCmsSnapshot"
import {
  buildRegistrationContent,
  type RegistrationContent,
} from "@/modules/public/store-registration/presentation/registration-plans"

// The registration page's plans and copy: published CMS content over the static
// defaults. Always complete, so the page never waits on the network.
export function useRegistrationContent(): RegistrationContent {
  const snapshot = useCmsSnapshot()
  return useMemo(() => buildRegistrationContent(snapshot), [snapshot])
}
