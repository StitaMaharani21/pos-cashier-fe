import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuthStore } from "@/shared/auth/store"

interface RequireAuthProps {
  children: ReactNode
}

// Only role === "owner" gets past this guard — cashier accounts (mobile app
// only) can't log into this web app even if they somehow hit /auth/login/password.
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)

  if (!isAuthenticated || role !== "owner") {
    return <Navigate to="/login" replace />
  }

  return children
}
