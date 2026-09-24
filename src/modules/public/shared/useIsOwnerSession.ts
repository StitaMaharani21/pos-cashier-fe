import { useAuthStore } from "@/shared/auth/store"

// True when an owner session already exists — public pages then swap their
// "Daftar…"/"Masuk" CTAs for a way back into the console (/app) instead of
// asking a logged-in owner to sign up again.
export function useIsOwnerSession(): boolean {
  return useAuthStore((state) => state.isAuthenticated && state.role === "owner")
}
