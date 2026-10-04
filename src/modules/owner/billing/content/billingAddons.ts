import type { Feature } from "@/shared/access/types"
import { featureCopy } from "@/shared/access/upsellContent"

// The 3 add-on codes pos-kasir-be currently knows (internal/central/store_addon):
// REPORTS/INVENTORY map 1:1 to a Feature and go through the same
// contactLink()/upgradeHint() flow every other locked-feature CTA uses.
// EXTRA_CASHIER is a quota bump, not an entitlement flag — it has no Feature
// and never appears in caps.locked, so AddonCard special-cases it.
export interface BillingAddon {
  code: "REPORTS" | "INVENTORY" | "EXTRA_CASHIER"
  feature?: Feature
  title: string
  description: string
}

export const BILLING_ADDONS: BillingAddon[] = [
  {
    code: "REPORTS",
    feature: "reports",
    title: featureCopy.reports?.title ?? "Laporan Lengkap",
    description: featureCopy.reports?.description ?? "",
  },
  {
    code: "INVENTORY",
    feature: "inventory_full",
    title: featureCopy.inventory_full?.title ?? "Inventori Lengkap",
    description: featureCopy.inventory_full?.description ?? "",
  },
  {
    code: "EXTRA_CASHIER",
    title: "Kasir Tambahan",
    description: "Tambah kuota akun kasir di luar batas paket Anda.",
  },
]
