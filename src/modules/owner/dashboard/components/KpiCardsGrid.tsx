import { useState } from "react"
import {
  BanknoteIcon,
  CreditCardIcon,
  ReceiptIcon,
  TrendingUpIcon,
  UndoIcon,
  WalletIcon,
} from "lucide-react"

import { CashCountDialog } from "@/modules/owner/dashboard/components/CashCountDialog"
import { KpiCard } from "@/modules/owner/dashboard/components/KpiCard"
import {
  useCashSummary,
  useDashboardSummary,
  useRefundSummaryToday,
} from "@/modules/owner/dashboard/dashboard.queries"
import { formatRupiah } from "@/shared/lib/utils"

function DeltaFooter({ percent, label }: { percent: number; label: string }) {
  const positive = percent >= 0
  return (
    <div className="flex items-center gap-1 text-xs">
      <span
        className={cnDelta(positive)}
      >
        {positive && <TrendingUpIcon className="size-3" />}
        {positive ? "+" : ""}
        {percent.toFixed(1)}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

function cnDelta(positive: boolean) {
  return positive
    ? "flex items-center gap-1 font-semibold text-emerald-600"
    : "font-semibold text-destructive"
}

function SkeletonCard() {
  return <div className="h-[141px] animate-pulse rounded-xl border bg-muted/40" />
}

export function KpiCardsGrid() {
  const [cashDialogOpen, setCashDialogOpen] = useState(false)
  const summary = useDashboardSummary()
  const cashSummary = useCashSummary()
  const refundSummary = useRefundSummaryToday()

  if (summary.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const data = summary.data
  const hasMismatch = cashSummary.data?.has_mismatch ?? false

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={WalletIcon}
          label="Total Pendapatan"
          value={data ? formatRupiah(data.total_revenue ?? 0) : "—"}
          footer={
            data && (
              <DeltaFooter
                percent={data.total_revenue_change_percent ?? 0}
                label="vs kemarin"
              />
            )
          }
        />
        <KpiCard
          icon={ReceiptIcon}
          label="Total Pesanan"
          value={
            data && (
              <>
                {data.total_orders ?? 0}{" "}
                <span className="text-sm font-normal text-muted-foreground">Pesanan</span>
              </>
            )
          }
          footer={
            data && (
              <DeltaFooter
                percent={data.total_orders_change_percent ?? 0}
                label="vs kemarin"
              />
            )
          }
        />
        <KpiCard
          icon={BanknoteIcon}
          iconTone="neutral"
          label="Total Cash"
          value={data ? formatRupiah(data.total_cash ?? 0) : "—"}
          footer={<span className="text-xs text-muted-foreground">Sistem POS</span>}
        />
        <KpiCard
          icon={CreditCardIcon}
          iconTone="neutral"
          label="Total Non-Cash"
          value={data ? formatRupiah(data.total_non_cash ?? 0) : "—"}
          footer={<span className="text-xs text-muted-foreground">QRIS &amp; Kartu</span>}
        />
        <KpiCard
          icon={WalletIcon}
          iconTone={hasMismatch ? "warning" : "primary"}
          tone={hasMismatch ? "warning" : "default"}
          label="Aktual Cash Laci"
          onClick={() => setCashDialogOpen(true)}
          value={
            cashSummary.isPending
              ? "—"
              : cashSummary.isError || !cashSummary.data
                ? "Tidak ada shift aktif"
                : formatRupiah(cashSummary.data.counted_amount ?? 0)
          }
          footer={
            cashSummary.data?.has_count &&
            (hasMismatch ? (
              <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                Selisih {formatRupiah(cashSummary.data.difference ?? 0)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Sesuai sistem</span>
            ))
          }
        />
        <KpiCard
          icon={UndoIcon}
          iconTone="neutral"
          label="Total Refund"
          value={refundSummary.data ? formatRupiah(refundSummary.data.total_amount ?? 0) : "—"}
          footer={
            refundSummary.data && (
              <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {refundSummary.data.count} Transaksi
              </span>
            )
          }
        />
      </div>

      <CashCountDialog
        open={cashDialogOpen}
        onOpenChange={setCashDialogOpen}
        cashSummary={cashSummary.data}
      />
    </>
  )
}
