import type { ReactNode } from "react"
import { LoaderCircleIcon } from "lucide-react"
import { Navigate } from "react-router-dom"

import { useCapabilities } from "@/shared/access/useCapabilities"
import { useAuthStore } from "@/shared/auth/store"

interface RequireAuthProps {
  children: ReactNode
}

// Only role === "owner" gets past this guard — cashier accounts (mobile app
// only) can't log into this web app even if they somehow hit /auth/login/password.
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)
  const token = useAuthStore((state) => state.token)
  const storeCode = useAuthStore((state) => state.store_code)

  // token + store_code come from the same login response; every API call
  // needs both, so a session missing either is unusable.
  if (!isAuthenticated || role !== "owner" || !token || !storeCode) {
    return <Navigate to="/login" replace />
  }

  return <ValidatedSession>{children}</ValidatedSession>
}

// The persisted flag alone proves nothing (a stale or hand-edited
// localStorage entry would open the console shell), so before rendering it the
// session is checked against the server. GET /me/capabilities is the call the
// console makes on every visit anyway, and it shares its react-query cache
// with OwnerLayout — so this costs no extra request. A 401 makes the axios
// interceptor log the session out (as does a 404 unknown_store, i.e. a
// store_code that no longer exists), which re-renders RequireAuth into the
// redirect above. Any other failure (server down, 5xx) lets the console render
// so its own pages can show their error states; the API stays the real gate.
function ValidatedSession({ children }: RequireAuthProps) {
  const { isLoading } = useCapabilities()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status">
        <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" aria-label="Memeriksa sesi" />
      </div>
    )
  }

  return children
}
