import { AddonCard } from "@/modules/owner/billing/components/AddonCard"
import { BILLING_ADDONS } from "@/modules/owner/billing/content/billingAddons"
import type { Capabilities } from "@/shared/access/types"

export function AddonList({ caps }: { caps: Capabilities }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Add-on</h2>
        <p className="text-sm text-muted-foreground">
          Nyalakan satu fitur tambahan tanpa upgrade paket penuh.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {BILLING_ADDONS.map((addon) => (
          <AddonCard key={addon.code} addon={addon} caps={caps} />
        ))}
      </div>
    </div>
  )
}
