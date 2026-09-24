import axios, { type AxiosError } from "axios"
import { toast } from "sonner"

import type { Feature, UpgradeHint } from "@/shared/access/types"
import { upsellStore } from "@/shared/access/upsellStore"
import { CAPABILITIES_QUERY_KEY } from "@/shared/access/queryKeys"
import { useAuthStore } from "@/shared/auth/store"
import { env } from "@/shared/config/env"
import { queryClient } from "@/shared/api/queryClient"

export interface ApiErrorPayload {
  code: string
  message: string
}

export class ApiError extends Error {
  code: string
  // HTTP status of the response this came from — queryClient.ts's retry
  // policy reads it to skip retrying 4xx.
  status?: number

  constructor(payload: ApiErrorPayload, status?: number) {
    super(payload.message)
    this.code = payload.code
    this.status = status
  }
}

declare module "axios" {
  interface AxiosRequestConfig {
    // For endpoints whose caller already renders its own 403 state (e.g. the
    // Pro-only low-stock widget) — suppresses the global "no access" toast.
    skipForbiddenToast?: boolean
  }
}

// Thrown when the request never got a response at all — connection
// refused, DNS failure, or (most commonly in dev) a CORS preflight
// rejection. Axios/the browser gives no response body in this case, so it's
// deliberately a different type from ApiError: callers showing "Login
// failed" for this is what makes a CORS misconfiguration look identical to
// a wrong password — distinguish them instead.
export class NetworkError extends Error {}

// internal/middleware/entitlement_middleware.go's RequireFeature aborts with
// this flat shape (no `message`, no nested `data`) — deliberately not an
// ApiError/AppError, since it needs to carry feature + upgrade_hint for the
// upsell modal, not just code + message.
interface FeatureNotInPlanPayload {
  code: "FEATURE_NOT_IN_PLAN"
  feature: Feature
  upgrade_hint: UpgradeHint
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
})

apiClient.interceptors.request.use((config) => {
  const { token, store_code } = useAuthStore.getState()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  // Every route except login is dispatched to a tenant DB resolved from
  // this header (pos-kasir-be's cmd/main.go outer router). Login itself
  // resolves the tenant server-side from the submitted email, so
  // store_code isn't known yet on that one call — the header is simply
  // omitted for it, and set from then on once the login response provides
  // it (see shared/auth/store.ts).
  if (store_code) {
    config.headers.set("X-Store-Code", store_code)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload | FeatureNotInPlanPayload>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    if (error.response?.status === 402 && error.response.data?.code === "FEATURE_NOT_IN_PLAN") {
      const body = error.response.data as FeatureNotInPlanPayload
      // The store's plan/addon cache in the frontend may be stale (e.g. an
      // addon just expired) — refetch before showing the upsell so the
      // sidebar reflects reality on the next render too.
      queryClient.invalidateQueries({ queryKey: CAPABILITIES_QUERY_KEY })
      upsellStore.open(body.feature, body.upgrade_hint)
      return Promise.reject(error)
    }

    if (error.response?.status === 403 && !error.config?.skipForbiddenToast) {
      // Fixed id so parallel/refetched 403s collapse into one toast instead
      // of stacking.
      toast.error("Anda tidak memiliki akses untuk tindakan ini.", { id: "forbidden" })
    }

    const payload = error.response?.data
    if (payload && "message" in payload && payload.code && payload.message) {
      return Promise.reject(new ApiError(payload, error.response?.status))
    }

    if (!error.response) {
      return Promise.reject(
        new NetworkError(
          "Could not reach the server. Check that the API is running and reachable (and, in the browser, that its ALLOWED_ORIGINS includes this app's origin)."
        )
      )
    }

    return Promise.reject(error)
  }
)
