import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/shared/api/client"

import { CAPABILITIES_QUERY_KEY } from "./queryKeys"
import type { Action, Capabilities, Feature, FeatureState, Module, UpgradeHint } from "./types"

// pos-kasir-be wraps every success response as {message, data} (response.Success) —
// GET /me/capabilities is no exception, so the Capabilities payload itself is nested.
interface CapabilitiesEnvelope {
  message: string
  data: Capabilities
}

export function useCapabilities() {
  const query = useQuery({
    queryKey: CAPABILITIES_QUERY_KEY,
    queryFn: () =>
      apiClient
        .get<CapabilitiesEnvelope>("/me/capabilities")
        .then((response) => response.data.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const caps = query.data

  function featureState(feature?: Feature): FeatureState {
    if (!feature || !caps) return "open"
    if (caps.features.includes(feature)) return "open"
    if (caps.hidden.includes(feature)) return "hidden"
    return "locked"
  }

  function hasFeature(feature?: Feature) {
    return featureState(feature) === "open"
  }

  // A module absent from caps.permissions means the store's plan doesn't
  // include the feature that module requires — treated the same as "present
  // but doesn't include this action". No separate role.is_owner short-circuit
  // needed here: pos-kasir-be's rbac.PermissionSet.Actions() already bakes
  // the owner bypass into every action array it returns.
  function can(module?: Module, action: Action = "view") {
    if (!module || !caps) return true
    return caps.permissions[module]?.includes(action) ?? false
  }

  function upgradeHint(feature: Feature): UpgradeHint {
    return caps?.locked.find((locked) => locked.feature === feature)?.upgrade_hint ?? "UPGRADE_PRO"
  }

  return {
    caps,
    isLoading: query.isLoading,
    refetch: query.refetch,
    featureState,
    hasFeature,
    can,
    upgradeHint,
  }
}
