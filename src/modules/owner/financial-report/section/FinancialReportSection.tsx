import { DownloadIcon, LoaderCircleIcon } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { ReportFilterBar } from "@/modules/owner/financial-report/components/ReportFilterBar"
import {
  useCancelledSummary,
  useExportSalesReport,
} from "@/modules/owner/financial-report/financial-report.queries"
import type { TopProductsSort } from "@/modules/owner/financial-report/financial-report.types"
import { presetToDateRange } from "@/modules/owner/financial-report/lib/date-presets"
import { CashierRankingTab } from "@/modules/owner/financial-report/section/CashierRankingTab"
import { CategoryBreakdownTab } from "@/modules/owner/financial-report/section/CategoryBreakdownTab"
import { DiscountsTab } from "@/modules/owner/financial-report/section/DiscountsTab"
import { OrderSourceTab } from "@/modules/owner/financial-report/section/OrderSourceTab"
import { PaymentMethodTab } from "@/modules/owner/financial-report/section/PaymentMethodTab"
import { PeakHoursTab } from "@/modules/owner/financial-report/section/PeakHoursTab"
import { SummaryTab } from "@/modules/owner/financial-report/section/SummaryTab"
import { TaxTab } from "@/modules/owner/financial-report/section/TaxTab"
import { TopProductsTab } from "@/modules/owner/financial-report/section/TopProductsTab"
import { TransactionsTab } from "@/modules/owner/financial-report/section/TransactionsTab"
import { VoidTransactionsTab } from "@/modules/owner/financial-report/section/VoidTransactionsTab"
import { downloadBlob } from "@/shared/lib/download"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/ui/page-header"
import { PageTabs, type PageTab } from "@/shared/ui/page-tabs"
import { friendlyErrorMessage } from "@/shared/api/error-message"

type Tab =
  | "summary"
  | "payment-method"
  | "discounts"
  | "transactions"
  | "cashier"
  | "void"
  | "category"
  | "peak-hours"
  | "top-products"
  | "tax"
  | "order-source"

const TAB_IDS: Tab[] = [
  "summary",
  "payment-method",
  "discounts",
  "transactions",
  "cashier",
  "void",
  "category",
  "peak-hours",
  "top-products",
  "tax",
  "order-source",
]

// Two levels instead of 11 flat tabs: 6 groups at the top (scannable at a
// glance), and a group with more than one leaf gets a second row of pills
// for its own leaves. The URL still only tracks the LEAF id (`?tab=`, same
// as before) — the active GROUP is derived from which group contains that
// leaf, so every existing deep link (onViewVoid, PopularMenuTable's
// ?tab=top-products) keeps working unchanged. Void/Batal stays its OWN
// top-level group (not nested under "Lainnya") so the anti-fraud badge
// stays visible without an extra click, per the product requirement that
// void data must be prominent, not buried.
type Group = "summary" | "payment-discount" | "performance" | "void" | "transactions" | "other"

const GROUPS: { id: Group; label: string; leaves: PageTab<Tab>[] }[] = [
  { id: "summary", label: "Ringkasan", leaves: [{ id: "summary", label: "Ringkasan" }] },
  {
    id: "payment-discount",
    label: "Pembayaran & Diskon",
    leaves: [
      { id: "payment-method", label: "Metode Pembayaran" },
      { id: "discounts", label: "Diskon" },
    ],
  },
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
  { id: "void", label: "Dibatalkan", leaves: [{ id: "void", label: "Pesanan Dibatalkan" }] },
  { id: "transactions", label: "Transaksi", leaves: [{ id: "transactions", label: "Detail Transaksi" }] },
  {
    id: "other",
    label: "Lainnya",
    leaves: [
      { id: "tax", label: "Pajak" },
      { id: "order-source", label: "Sumber Pesanan" },
    ],
  },
]

// Every tab id doubles as its `report=` id on GET /reports/sales/export 1:1
// — kept as an explicit map (rather than just passing `tab` straight
// through) so it reads as a deliberate contract with the backend's export
// endpoint, not an accident of the tab ids happening to match.
const REPORT_ID: Record<Tab, string> = {
  summary: "summary",
  "payment-method": "payment-method",
  discounts: "discounts",
  transactions: "transactions",
  cashier: "cashier",
  void: "void",
  category: "category",
  "peak-hours": "peak-hours",
  "top-products": "top-products",
  tax: "tax",
  "order-source": "order-source",
}

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

  // Fetched once here (rather than inside VoidTransactionsTab) so the "Void/
  // Batal" tab count badge is visible even before the tab is opened.
  // VoidTransactionsTab's body and SummaryTab's anti-fraud banner call the
  // exact same useCancelledSummary({ from, to }) hook, which shares this
  // query's cache key — so opening either doesn't trigger a second fetch.
  const cancelledSummary = useCancelledSummary({ from, to })

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

  const groupTabs: PageTab<Group>[] = GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    count:
      g.id === "void" && cancelledSummary.data?.total_count
        ? cancelledSummary.data.total_count
        : undefined,
  }))

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
    setSearchParams(next, { replace: true })
  }

  function handleExport() {
    exportMutation.mutate(
      {
        report: REPORT_ID[tab],
        from,
        to,
        ...(tab === "transactions" ? { kasirId: cashierId, orderNo } : {}),
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
        description="Ringkasan pendapatan, metode pembayaran, diskon, dan detail transaksi toko"
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
        {tab === "summary" && (
          <SummaryTab from={from} to={to} onViewVoid={() => setTab("void")} />
        )}
        {tab === "payment-method" && <PaymentMethodTab from={from} to={to} />}
        {tab === "discounts" && <DiscountsTab from={from} to={to} />}
        {tab === "transactions" && (
          <TransactionsTab
            from={from}
            to={to}
            cashierId={cashierId}
            onCashierIdChange={setCashierId}
            orderNo={orderNo}
            onOrderNoChange={setOrderNo}
          />
        )}
        {tab === "cashier" && <CashierRankingTab from={from} to={to} />}
        {tab === "void" && <VoidTransactionsTab from={from} to={to} />}
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
        {tab === "tax" && <TaxTab from={from} to={to} />}
        {tab === "order-source" && <OrderSourceTab from={from} to={to} />}
      </div>
    </div>
  )
}
