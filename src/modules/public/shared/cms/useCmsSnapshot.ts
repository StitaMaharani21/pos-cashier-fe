import { useQuery } from "@tanstack/react-query"

import { fetchLandingContent } from "@/modules/public/shared/cms/cms.api"
import {
  type CmsLandingResponse,
  type CmsSnapshot,
  SUPPORTED_SCHEMA_VERSION,
} from "@/modules/public/shared/cms/cms.types"

const STALE_MS = 5 * 60_000
const CACHE_PREFIX = "neela:cms:landing:v1:"

interface CachedLanding {
  at: number
  response: CmsLandingResponse
}

// The last good response is kept in localStorage so a returning visitor sees the
// published copy on first paint instead of the static one flashing first. Every
// access is guarded: storage can be blocked (private window) and must never
// break the page.
function readCache(locale: string): CachedLanding | null {
  try {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(CACHE_PREFIX + locale)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedLanding
    return parsed?.response?.data?.schema_version === SUPPORTED_SCHEMA_VERSION ? parsed : null
  } catch {
    return null
  }
}

function writeCache(locale: string, response: CmsLandingResponse) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + locale, JSON.stringify({ at: Date.now(), response } satisfies CachedLanding))
  } catch {
    // quota / blocked storage: the cache is only an optimisation
  }
}

// The published CMS snapshot, or null while loading / when there is none (no
// release yet, API down, unknown schema) — callers then render their static
// fallback. Never throws and never shows a loading state: the static content IS
// the loading state.
export function useCmsSnapshot(locale = "id"): CmsSnapshot | null {
  const { data } = useQuery({
    queryKey: ["cms", "landing", locale],
    queryFn: async ({ signal }) => {
      const response = await fetchLandingContent(locale, signal)
      writeCache(locale, response)
      return response
    },
    initialData: () => readCache(locale)?.response,
    initialDataUpdatedAt: () => readCache(locale)?.at,
    staleTime: STALE_MS,
    gcTime: 30 * 60_000,
    // A marketing page shouldn't hammer a struggling API: one retry, no refocus refetch.
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const snapshot = data?.data
  return snapshot && snapshot.schema_version === SUPPORTED_SCHEMA_VERSION ? snapshot : null
}
