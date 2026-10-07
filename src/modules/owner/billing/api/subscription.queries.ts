import { useQuery } from "@tanstack/react-query"

import {
  SUBSCRIPTION_KEY,
  getCurrentSubscription,
  listAddonCatalog,
  listPlans,
} from "@/modules/owner/billing/api/subscription.service"

// The billing page works without these: when a query fails (older backend,
// network) the cards fall back to the static price list and the WhatsApp
// buttons, so nothing here is allowed to block the page.

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: [...SUBSCRIPTION_KEY, "plans"],
    queryFn: listPlans,
    staleTime: 60_000,
    retry: false,
  })
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: [...SUBSCRIPTION_KEY, "current"],
    queryFn: getCurrentSubscription,
    staleTime: 30_000,
    retry: false,
  })
}

export function useAddonCatalog() {
  return useQuery({
    queryKey: [...SUBSCRIPTION_KEY, "addons"],
    queryFn: listAddonCatalog,
    staleTime: 30_000,
    retry: false,
  })
}
