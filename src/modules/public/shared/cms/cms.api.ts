import axios from "axios"

import type { CmsLandingResponse } from "@/modules/public/shared/cms/cms.types"
import { env } from "@/shared/config/env"

// GET /public/cms/landing is public (no token, no X-Store-Code) and mounted on
// the backend's outer router — NOT under /api/v1 (pos-kasir-be cmd/main.go).
// Resolved against the API's origin, like the registration endpoints.
//
// Plain axios, deliberately NOT apiClient: that one attaches an owner's token
// and store code when a session sits in localStorage and logs the owner out on
// a 401 — wrong for a marketing page. Computed per call (not at module load)
// so this file stays safe to import during SSR.
function landingUrl(): string {
  const apiBase = new URL(env.apiBaseUrl, window.location.origin)
  return new URL("/public/cms/landing", apiBase).toString()
}

export async function fetchLandingContent(locale: string, signal?: AbortSignal): Promise<CmsLandingResponse> {
  const response = await axios.get<CmsLandingResponse>(landingUrl(), {
    params: { locale },
    timeout: 8000,
    signal,
  })
  return response.data
}
