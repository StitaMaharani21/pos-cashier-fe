import { create } from "zustand"
import { persist } from "zustand/middleware"

import { CAPABILITIES_QUERY_KEY } from "@/shared/access/queryKeys"
import { queryClient } from "@/shared/api/queryClient"

export type Role = "owner" | "cashier"

interface Session {
  token: string
  name: string
  role: Role
  store_code: string
  // Not part of LoginResponse (the backend doesn't echo it back) — passed
  // through from the login form's own submitted value so the header can
  // show it (see LoginSection.tsx).
  email?: string
}

interface AuthState {
  token: string | null
  name: string | null
  role: Role | null
  email: string | null
  // The tenant DB resolved at login (see entities/auth/model/auth.types.ts
  // LoginResponse) — replayed as X-Store-Code on every later request
  // (shared/api/client.ts) instead of a build-time env var.
  store_code: string | null
  isAuthenticated: boolean
  login: (session: Session) => void
  // Keeps the header's name/email in sync after the Profile page saves or
  // loads the account (modules/owner/profile) — LoginResponse only carries
  // the name as it was at login time.
  setProfile: (profile: { name: string; email?: string | null }) => void
  logout: () => void
}

// Persisted to localStorage: the backend is bearer-token-only (no cookie
// session), so this is the one place the token lives across page reloads.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      role: null,
      email: null,
      store_code: null,
      isAuthenticated: false,
      login: ({ token, name, role, email, store_code }) =>
        set({ token, name, role, email: email ?? null, store_code, isAuthenticated: true }),
      setProfile: ({ name, email }) =>
        set((state) => ({ name, email: email || state.email })),
      logout: () => {
        // Otherwise the next login in the same browser (a different owner
        // account, or a demoted role) would briefly render against this
        // account's cached plan/permissions until the query refetches.
        queryClient.removeQueries({ queryKey: CAPABILITIES_QUERY_KEY })
        set({ token: null, name: null, role: null, email: null, store_code: null, isAuthenticated: false })
      },
    }),
    { name: "pos-kasir-owner-auth" }
  )
)
