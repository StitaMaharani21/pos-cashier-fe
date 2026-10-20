import { DownloadIcon, LoaderCircleIcon } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { ReportFilterBar } from "@/modules/owner/financial-report/components/ReportFilterBar"
import { useExportSalesReport } from "@/modules/owner/financial-report/financial-report.queries"
import type { TopProductsSort } from "@/modules/owner/financial-report/financial-report.types"
import { presetToDateRange } from "@/modules/owner/financial-report/lib/date-presets"
import { CashierRankingTab } from "@/modules/owner/financial-report/section/CashierRankingTab"
import { CategoryBreakdownTab } from "@/modules/owner/financial-report/section/CategoryBreakdownTab"
import { OrderSourceTab } from "@/modules/owner/financial-report/section/OrderSourceTab"
import { PeakHoursTab } from "@/modules/owner/financial-report/section/PeakHoursTab"
import { SummaryTab } from "@/modules/owner/financial-report/section/SummaryTab"
import { TopProductsTab } from "@/modules/owner/financial-report/section/TopProductsTab"
import { TransactionsTab } from "@/modules/owner/financial-report/section/TransactionsTab"
import { downloadBlob } from "@/shared/lib/download"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/ui/page-header"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"
import { friendlyErrorMessage } from "@/shared/api/error-message"

type Tab =
  | "summary"
  | "transactions"
  | "cashier"
  | "category"
  | "peak-hours"
  | "top-products"
  | "order-source"

const TAB_IDS: Tab[] = [
  "summary",
  "transactions",
  "cashier",
  "category",
  "peak-hours",
  "top-products",
  "order-source",
]

// Two levels: 4 groups at the top (Ringkasan, Kinerja, Transaksi, Lainnya),
// and a group with more than one leaf gets a second row of pills for its own
// leaves. The URL still only tracks the LEAF id (`?tab=`) — the active GROUP
// is derived from which group contains that leaf, so deep links
// (PopularMenuTable's ?tab=top-products, the cancelled banner's
// ?tab=transactions&status=dibatalkan) keep working. Payments, discounts and
// tax live inside Ringkasan; cancelled orders are a Status filter on
// Transaksi, so there is no separate "Dibatalkan" tab. A removed tab id in an
// old URL falls back to Ringkasan.
type Group = "summary" | "performance" | "transactions" | "other"

const GROUPS: { id: Group; label: string; leaves: PageTab<Tab>[] }[] = [
  { id: "summary", label: "Ringkasan", leaves: [{ id: "summary", label: "Ringkasan" }] },
  {
    id: "performance",
    label: "Kinerja",
    leaves: [
      { id: "cashier", label: "Kasir" },
      { id: "category", label: "Kategori" },
      { id: "top-products", label: "Produk Terlaris" },
      { id: "peak-hours", label: "Jam Sibuk" },
    ],
  },
  { id: "transactions", label: "Transaksi", leaves: [{ id: "transactions", label: "Detail Transaksi" }] },
  { id: "other", label: "Lainnya", leaves: [{ id: "order-source", label: "Sumber Pesanan" }] },
]

// Tab id → the backend's `report=` id on GET /reports/sales/export. NOT 1:1
// (the backend ids are by-cashier, by-category, ...): sending the tab id
// straight through used to 400 for those tabs. Ringkasan exports the daily
// breakdown (it carries every figure on the page: orders, gross, discount,
// tax, net — with a totals row).
const REPORT_ID: Record<Tab, string> = {
  summary: "daily",
  transactions: "transactions",
  cashier: "by-cashier",
  category: "by-category",
  "peak-hours": "peak-hours",
  "top-products": "top-products",
  "order-source": "order-source",
}

// Statuses the Transaksi filter offers (also what the backend accepts).
const TRANSACTION_STATUSES = ["selesai", "dibatalkan", "direfund"]

// Matches useTopProducts's own default `limit` (financial-report.queries.ts)
// — TopProductsTab has no user-facing limit control today, so the export
// mirrors whatever the tab itself actually fetched.
const TOP_PRODUCTS_EXPORT_LIMIT = 10

// /app/financial-report — "Laporan Keuangan", replacing sales-report as the
// richer financial reporting page (sales-report stays mounted at its own
// route until a later cleanup phase removes it — see AppRouter/routeAccess).
//
// One date range for the whole page, held in ?from=&to= and passed down to
// every tab — fixing sales-report's known bug where the date filter only
// ever reached the transaction table, never its KPI cards. ?tab= picks the
// active tab (default "summary"), same PageTabs/?tab= idiom as
// MenuCatalogSection/UsersSection.
export function FinancialReportSection() {
  const [searchParams, setSearchParams] = useSearchParams()

  const today = presetToDateRange("today")
  const from = searchParams.get("from") || today.from
  const to = searchParams.get("to") || today.to

  const rawTab = searchParams.get("tab")
  const tab: Tab = TAB_IDS.includes(rawTab as Tab) ? (rawTab as Tab) : "summary"

  // Order-status filter of the Transaksi tab. In the URL (not state) so the
  // Ringkasan banner can deep-link to it, and a refresh keeps it. Only a
  // known status is honoured; it only applies on the transactions tab.
  const rawStatus = searchParams.get("status")
  const status =
    tab === "transactions" && rawStatus && TRANSACTION_STATUSES.includes(rawStatus) ? rawStatus : undefined

  // TransactionsTab's (Kasir/No. Order) and TopProductsTab's (sort) filters
  // are lifted up here — not because the shell needs to react to them, but
  // so the Export button below can include whatever the active tab is
  // currently filtered/sorted by as export params, matching what's on
  // screen instead of always exporting the unfiltered/default view.
  const [cashierId, setCashierId] = useState<number | undefined>(undefined)
  const [orderNo, setOrderNo] = useState("")
  const [topProductsSort, setTopProductsSort] = useState<TopProductsSort>("qty")

  const exportMutation = useExportSalesReport()

  const activeGroup = GROUPS.find((g) => g.leaves.some((leaf) => leaf.id === tab)) ?? GROUPS[0]

  const groupTabs: PageTab<Group>[] = GROUPS.map((g) => ({ id: g.id, label: g.label }))

  function setGroup(id: Group) {
    const group = GROUPS.find((g) => g.id === id)
    if (group) setTab(group.leaves[0].id)
  }

  function setRange(nextFrom: string, nextTo: string) {
    const next = new URLSearchParams(searchParams)
    next.set("from", nextFrom)
    next.set("to", nextTo)
    setSearchParams(next, { replace: true })
  }

  function setTab(id: Tab) {
    const next = new URLSearchParams(searchParams)
    if (id === "summary") next.delete("tab")
    else next.set("tab", id)
    // The status filter belongs to Transaksi only.
    next.delete("status")
    setSearchParams(next, { replace: true })
  }

  function setStatus(nextStatus: string | undefined) {
    const next = new URLSearchParams(searchParams)
    if (nextStatus) next.set("status", nextStatus)
    else next.delete("status")
    setSearchParams(next, { replace: true })
  }

  // The Ringkasan banner: Transaksi with "Dibatalkan" preselected, in ONE
  // update (two setSearchParams calls would race and drop the first).
  function viewCancelled() {
    const next = new URLSearchParams(searchParams)
    next.set("tab", "transactions")
    next.set("status", "dibatalkan")
    setSearchParams(next, { replace: true })
  }

  function handleExport() {
    exportMutation.mutate(
      {
        report: REPORT_ID[tab],
        from,
        to,
        ...(tab === "transactions" ? { kasirId: cashierId, orderNo, status } : {}),
        ...(tab === "top-products"
          ? { sort: topProductsSort, limit: TOP_PRODUCTS_EXPORT_LIMIT }
          : {}),
      },
      {
        onSuccess: (blob) => {
          downloadBlob(blob, `laporan-${REPORT_ID[tab]}-${from}-sd-${to}.xlsx`)
        },
        onError: (error) => {
          toast.error(friendlyErrorMessage(error, "Gagal mengunduh laporan"))
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Laporan Keuangan"
        description="Pendapatan, diskon, pajak, metode pembayaran, kinerja kasir, dan detail transaksi toko"
      />

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <ReportFilterBar from={from} to={to} onChange={setRange} />
        <Button type="button" variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
          {exportMutation.isPending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <DownloadIcon />
          )}
          Export
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <PageTabs label="Laporan Keuangan" tabs={groupTabs} active={activeGroup.id} onChange={setGroup} />
        {activeGroup.leaves.length > 1 && (
          <div role="tablist" aria-label={activeGroup.label} className="flex flex-wrap gap-2 pt-1">
            {activeGroup.leaves.map((leaf) => {
              const selected = leaf.id === tab
              return (
                <button
                  key={leaf.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(leaf.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {leaf.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div role="tabpanel">
        {tab === "summary" && <SummaryTab from={from} to={to} onViewCancelled={viewCancelled} />}
        {tab === "transactions" && (
          <TransactionsTab
            from={from}
            to={to}
            cashierId={cashierId}
            onCashierIdChange={setCashierId}
            orderNo={orderNo}
            onOrderNoChange={setOrderNo}
            status={status}
            onStatusChange={setStatus}
          />
        )}
        {tab === "cashier" && <CashierRankingTab from={from} to={to} />}
        {tab === "category" && <CategoryBreakdownTab from={from} to={to} />}
        {tab === "peak-hours" && <PeakHoursTab from={from} to={to} />}
        {tab === "top-products" && (
          <TopProductsTab
            from={from}
            to={to}
            sort={topProductsSort}
            onSortChange={setTopProductsSort}
          />
        )}
        {tab === "order-source" && <OrderSourceTab from={from} to={to} />}
      </div>
    </div>
  )
}
