import { useSearchParams } from "react-router-dom"

import { ReportFilterBar } from "@/modules/owner/financial-report/components/ReportFilterBar"
import { presetToDateRange } from "@/modules/owner/financial-report/lib/date-presets"
import { AnomaliesTab } from "@/modules/owner/cash-report/section/AnomaliesTab"
import { CashierRecapTab } from "@/modules/owner/cash-report/section/CashierRecapTab"
import { ShiftSummaryTab } from "@/modules/owner/cash-report/section/ShiftSummaryTab"
import { VarianceTrendTab } from "@/modules/owner/cash-report/section/VarianceTrendTab"
import { PageHeader } from "@/shared/ui/page-header"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"

// Flat tabs (not the 2-level grouped pattern FinancialReportSection uses —
// this page only has 4 tabs total, well under the threshold that justified
// grouping there).
type Tab = "shifts" | "cashier-recap" | "trend" | "anomalies"

const TAB_IDS: Tab[] = ["shifts", "cashier-recap", "trend", "anomalies"]

const TABS: PageTab<Tab>[] = [
  { id: "shifts", label: "Ringkasan Shift" },
  { id: "cashier-recap", label: "Rekap per Kasir" },
  { id: "trend", label: "Tren Selisih" },
  { id: "anomalies", label: "Selisih Tak Wajar" },
]

// /app/cash-report — "Laporan Kas": physical-cash reconciliation per cashier
// shift, separate from "Laporan Keuangan" (revenue/payment/discount
// reporting). One date range for the whole page, held in ?from=&to= (same
// ReportFilterBar + URL-state idiom as FinancialReportSection), ?tab= picks
// the active tab (default "shifts").
export function CashReportSection() {
  const [searchParams, setSearchParams] = useSearchParams()

  const today = presetToDateRange("today")
  const from = searchParams.get("from") || today.from
  const to = searchParams.get("to") || today.to

  const rawTab = searchParams.get("tab")
  const tab: Tab = TAB_IDS.includes(rawTab as Tab) ? (rawTab as Tab) : "shifts"

  function setRange(nextFrom: string, nextTo: string) {
    const next = new URLSearchParams(searchParams)
    next.set("from", nextFrom)
    next.set("to", nextTo)
    setSearchParams(next, { replace: true })
  }

  function setTab(id: Tab) {
    const next = new URLSearchParams(searchParams)
    if (id === "shifts") next.delete("tab")
    else next.set("tab", id)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Laporan Kas" description="Cocokkan uang tunai di laci kasir dengan catatan, per shift kasir" />

      <ReportFilterBar from={from} to={to} onChange={setRange} />

      <PageTabs label="Laporan Kas" tabs={TABS} active={tab} onChange={setTab} />

      <div role="tabpanel">
        {tab === "shifts" && <ShiftSummaryTab from={from} to={to} />}
        {tab === "cashier-recap" && <CashierRecapTab from={from} to={to} />}
        {tab === "trend" && <VarianceTrendTab />}
        {tab === "anomalies" && <AnomaliesTab from={from} to={to} />}
      </div>
    </div>
  )
}
