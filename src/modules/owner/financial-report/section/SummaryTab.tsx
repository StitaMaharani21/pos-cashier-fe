import { AlertTriangleIcon, ArrowRightIcon, PackageIcon, ReceiptIcon, TrendingUpIcon, WalletIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { DeltaFooter } from "@/modules/owner/financial-report/components/DeltaFooter"
import { KpiSkeletonGrid } from "@/modules/owner/financial-report/components/KpiSkeletonGrid"
import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useCancelledSummary, useSalesSummary } from "@/modules/owner/financial-report/financial-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { KpiCard } from "@/shared/ui/kpi-card"

// "Ringkasan" tab (default). Gross and net revenue are deliberately two
// separate KpiCards, never merged into one number — a store owner glancing
// at "Total Pendapatan" alone could easily mistake gross for take-home, so
// product asked for both to always be visible and clearly labeled.
export function SummaryTab({
  from,
  to,
  onViewVoid,
}: {
  from: string
  to: string
  // Navigates the page to the "Void/Batal" tab — wired to FinancialReportSection's
  // setTab("void") so the anti-fraud banner below is a real shortcut, not just
  // a label. Optional so this tab keeps working if ever rendered standalone.
  onViewVoid?: () => void
}) {
  const summary = useSalesSummary({ from, to })
  // Same useCancelledSummary({ from, to }) call (and therefore the same
  // React Query cache key) as FinancialReportSection's badge fetch and
  // VoidTransactionsTab's body — this banner never triggers its own
  // separate network request.
  const cancelledSummary = useCancelledSummary({ from, to })
  const [dismissed, setDismissed] = useState(false)

  if (summary.isPending) {
    return <KpiSkeletonGrid />
  }

  if (summary.isError || !summary.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat ringkasan"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => summary.refetch()}
      />
    )
  }

  const data = summary.data

  if (data.total_transactions === 0) {
    return (
      <ReportStateCard
        title="Belum ada transaksi pada periode ini"
        hint="Coba pilih rentang tanggal yang lain."
      />
    )
  }

  const cancelledCount = cancelledSummary.data?.total_count ?? 0

  return (
    <div className="flex flex-col gap-4">
      {cancelledCount > 0 && !dismissed && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangleIcon className="size-4" />
          </span>
          <p className="flex-1 text-sm font-medium text-foreground">
            {cancelledCount} transaksi dibatalkan pada periode ini —{" "}
            <button
              type="button"
              onClick={onViewVoid}
              className="inline-flex items-center gap-1 font-semibold text-destructive underline-offset-2 hover:underline"
            >
              lihat detail
              <ArrowRightIcon className="size-3.5" />
            </button>
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Tutup"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={ReceiptIcon}
          label="Total Transaksi"
          value={
            <>
              {data.total_transactions}{" "}
              <span className="text-sm font-normal text-muted-foreground">Order</span>
            </>
          }
          footer={
            <DeltaFooter
              percent={data.comparison.total_transactions_change_pct}
              label="dibanding periode sebelumnya"
            />
          }
        />
        <KpiCard
          icon={WalletIcon}
          iconTone="neutral"
          label="Pendapatan Kotor (sebelum diskon)"
          value={formatRupiah(data.gross_revenue)}
        />
        <KpiCard
          icon={WalletIcon}
          label="Pendapatan Bersih (setelah diskon)"
          value={formatRupiah(data.net_revenue)}
          footer={
            <DeltaFooter percent={data.comparison.net_revenue_change_pct} label="dibanding periode sebelumnya" />
          }
        />
        <KpiCard
          icon={TrendingUpIcon}
          iconTone="neutral"
          label="Rata-rata per Transaksi"
          value={formatRupiah(data.avg_per_transaction)}
        />
        <KpiCard
          icon={PackageIcon}
          iconTone="neutral"
          label="Rata-rata Item / Transaksi"
          value={data.avg_items_per_transaction.toFixed(1)}
        />
      </div>
    </div>
  )
}
