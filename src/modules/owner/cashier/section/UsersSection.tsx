import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { listCashiers } from "@/modules/owner/cashier/api/cashier.service"
import { CashierSection } from "@/modules/owner/cashier/section/CashierSection"
import { DEVICES_KEY, listDevices } from "@/modules/owner/device/api/device.service"
import { DeviceSection } from "@/modules/owner/device/section/DeviceSection"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"

type Tab = "cashiers" | "devices"

// /app/users — "Pengguna": cashier accounts (?tab absent) and the devices
// they may log in from (?tab=devices, QR pairing). Same tab pattern as
// /app/menu (MenuCatalogSection).
export function UsersSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get("tab") === "devices" ? "devices" : "cashiers"

  // Badges reuse each tab's own list query (same keys/params).
  const { data: cashiers } = useQuery({ queryKey: ["cashiers", "list"], queryFn: () => listCashiers(1, 100) })
  const { data: devices } = useQuery({ queryKey: DEVICES_KEY, queryFn: listDevices })

  const tabs: PageTab<Tab>[] = [
    { id: "cashiers", label: "Akun Kasir", count: cashiers?.length },
    { id: "devices", label: "Perangkat Kasir", count: devices?.filter((device) => device.status === "BOUND").length },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageTabs
        label="Pengguna"
        tabs={tabs}
        active={tab}
        onChange={(id) => setSearchParams(id === "cashiers" ? {} : { tab: id }, { replace: true })}
      />
      <div role="tabpanel">{tab === "cashiers" ? <CashierSection /> : <DeviceSection />}</div>
    </div>
  )
}
