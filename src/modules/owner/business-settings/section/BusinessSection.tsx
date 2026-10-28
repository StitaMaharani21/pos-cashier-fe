import { useSearchParams } from "react-router-dom"

import { BillingSection } from "@/modules/owner/billing/section/BillingSection"
import { BusinessSettingsSection } from "@/modules/owner/business-settings/section/BusinessSettingsSection"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"

type Tab = "info" | "paket"

const TABS: PageTab<Tab>[] = [
  { id: "info", label: "Informasi Bisnis" },
  { id: "paket", label: "Paket & Fitur Tambahan" },
]

// /app/business-settings — "Bisnis": the store's business info (?tab absent)
// and its plan + add-ons (?tab=paket; the old /app/billing redirects here).
// Same tab pattern as /app/users (UsersSection).
export function BusinessSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get("tab") === "paket" ? "paket" : "info"

  return (
    <div className="flex flex-col gap-6">
      <PageTabs
        label="Info Toko & Paket"
        tabs={TABS}
        active={tab}
        onChange={(id) => setSearchParams(id === "info" ? {} : { tab: id }, { replace: true })}
      />
      <div role="tabpanel">{tab === "info" ? <BusinessSettingsSection /> : <BillingSection />}</div>
    </div>
  )
}
