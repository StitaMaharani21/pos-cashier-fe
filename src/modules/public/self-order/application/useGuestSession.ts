import { useQuery } from "@tanstack/react-query"

import { resolveSession } from "@/modules/public/self-order/infrastructure/self-order.api"

export function guestSessionKey(storeCode: string, qrToken: string) {
  return ["guest-session", storeCode, qrToken] as const
}

// Trades the table's QR token for a guest token + the table's shared cart.
// Resolving again returns the same table cart (or a fresh one once the last
// was checked out), so a page refresh just re-resolves — nothing is persisted.
// A query keyed by the link (not a mutation) so StrictMode's dev remount can't
// drop the response; "Pesan lagi" refetches it for the new cart.
export function useGuestSession(storeCode: string, qrToken: string) {
  return useQuery({
    queryKey: guestSessionKey(storeCode, qrToken),
    queryFn: () => resolveSession(storeCode, qrToken),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
