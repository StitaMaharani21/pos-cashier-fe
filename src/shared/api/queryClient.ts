import { QueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"

// Module-level singleton — not created inside AppProviders' useState — so
// this file's own response interceptor (client.ts) can also invalidate or
// remove queries (e.g. capabilities, after a 402 or on logout) from outside
// the React tree.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx (403 plan gate, 404, validation...) won't succeed on retry —
      // retrying only multiplies the request and the interceptor's toasts.
      // Network errors and 5xx keep React Query's default 3 retries.
      retry: (failureCount, error) => {
        // Duck-typed rather than `instanceof ApiError` to avoid a circular
        // import with client.ts, which imports this module.
        const status = isAxiosError(error)
          ? error.response?.status
          : (error as { status?: number }).status
        if (status !== undefined && status >= 400 && status < 500) return false
        return failureCount < 3
      },
    },
  },
})
