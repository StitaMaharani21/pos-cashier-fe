import { create } from "zustand"

import type { Feature, UpgradeHint } from "./types"

interface UpsellState {
  feature: Feature | null
  hint: UpgradeHint | null
  open: (feature: Feature, hint: UpgradeHint) => void
  close: () => void
}

// Split from UpsellModal.tsx so non-React code (shared/api/client.ts's
// response interceptor, triggered on a 402 FEATURE_NOT_IN_PLAN) can open the
// modal without importing a .tsx file.
export const useUpsellStore = create<UpsellState>((set) => ({
  feature: null,
  hint: null,
  open: (feature, hint) => set({ feature, hint }),
  close: () => set({ feature: null, hint: null }),
}))

export const upsellStore = {
  open: (feature: Feature, hint: UpgradeHint) => useUpsellStore.getState().open(feature, hint),
}
