import {
  AlertTriangleIcon,
  ArrowRightIcon,
  LandmarkIcon,
  ReceiptIcon,
  TagIcon,
  TrendingUpIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import { DailyBreakdownTable } from "@/modules/owner/financial-report/components/DailyBreakdownTable"
import { DeltaFooter } from "@/modules/owner/financial-report/components/DeltaFooter"
import { KpiSkeletonGrid } from "@/modules/owner/financial-report/components/KpiSkeletonGrid"
import { PaymentChannelsCard } from "@/modules/owner/financial-report/components/PaymentChannelsCard"
import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useDiscountImpact, useSalesSummary } from "@/modules/owner/financial-report/financial-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { KpiCard } from "@/shared/ui/kpi-card"

// "Ringkasan" tab (default): the money picture of the period in one place —
// six figures (Gross − Discount + Tax = Net), how it was paid, and a daily
// breakdown. Gross and net stay separate cards so gross is never mistaken for
// take-home. Each block loads and fails on its own.
export function SummaryTab({
  from,
  to,
  onViewCancelled,
}: {
  from: string
  to: string
  // Opens the Transaksi tab filtered to cancelled orders (the banner's
  // "lihat detail").
  onViewCancelled?: () => void
}) {
  const summary = useSalesSummary({ from, to })
  const discounts = useDiscountImpact({ from, to })
  const [dismissed, setDismissed] = useState(false)

  if (summary.isPending) {
    return <KpiSkeletonGrid count={6} />
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
  const cancelledCount = data.cancelled_count ?? 0
  const discountData = discounts.data

  return (
    <div className="flex flex-col gap-6">
      {/* Shown even when nothing was completed: a period with only cancelled
          orders is exactly when the owner needs this. */}
      {cancelledCount > 0 && !dismissed && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangleIcon className="size-4" />
          </span>
          <p className="flex-1 text-sm font-medium text-foreground">
            {cancelledCount} transaksi dibatalkan pada periode ini —{" "}
            <button
              type="button"
              onClick={onViewCancelled}
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

      {data.total_transactions === 0 ? (
        <ReportStateCard
          title="Belum ada transaksi selesai pada periode ini"
          hint="Coba pilih rentang tanggal yang lain."
        />
      ) : (
        <>
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
              label="Pendapatan Kotor"
              value={formatRupiah(data.gross_revenue)}
              footer={<span className="text-xs text-muted-foreground">Sebelum diskon</span>}
            />
            <KpiCard
              icon={TagIcon}
              iconTone="neutral"
              label="Total Diskon"
              value={data.total_discount > 0 ? `-${formatRupiah(data.total_discount)}` : formatRupiah(0)}
              footer={
                <span className="text-xs text-muted-foreground">
                  {discountData
                    ? `Voucher ${discountData.voucher_order_count} order · Otomatis ${discountData.auto_discount_order_count} order`
                    : "Voucher & diskon otomatis"}
                </span>
              }
            />
            <KpiCard
              icon={LandmarkIcon}
              iconTone="neutral"
              label="Total Pajak"
              value={formatRupiah(data.total_tax)}
              footer={<span className="text-xs text-muted-foreground">PB1 / PPN yang dipungut</span>}
            />
            <KpiCard
              icon={WalletIcon}
              label="Pendapatan Bersih"
              value={formatRupiah(data.net_revenue)}
              footer={
                <DeltaFooter percent={data.comparison.net_revenue_change_pct} label="dibanding periode sebelumnya" />
              }
            />
            <KpiCard
              icon={TrendingUpIcon}
              iconTone="neutral"
              label="Rata-rata Transaksi"
              value={formatRupiah(data.avg_per_transaction)}
              footer={<span className="text-xs text-muted-foreground">Pendapatan bersih ÷ transaksi</span>}
            />
          </div>

          <PaymentChannelsCard from={from} to={to} />
          <DailyBreakdownTable from={from} to={to} />
        </>
      )}
    </div>
  )
}
