import { PercentIcon, TagIcon, TicketIcon, WalletIcon } from "lucide-react"

import { KpiSkeletonGrid } from "@/modules/owner/financial-report/components/KpiSkeletonGrid"
import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useDiscountImpact } from "@/modules/owner/financial-report/financial-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { KpiCard } from "@/shared/ui/kpi-card"

// "Diskon" tab — same gross-vs-net "never merge into one number" principle
// as SummaryTab, plus a voucher-vs-auto-discount split so an owner can tell
// whether discounting is mostly manual (voucher codes) or automatic
// (promo rules) driven.
export function DiscountsTab({ from, to }: { from: string; to: string }) {
  const query = useDiscountImpact({ from, to })

  if (query.isPending) {
    return <KpiSkeletonGrid />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data diskon"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const data = query.data

  if (data.total_order_count === 0) {
    return (
      <ReportStateCard
        title="Belum ada transaksi pada periode ini"
        hint="Coba pilih rentang tanggal yang lain."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        icon={TagIcon}
        label="Total Diskon Diberikan"
        value={formatRupiah(data.total_discount_value)}
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
      />
      <KpiCard
        icon={TicketIcon}
        iconTone="neutral"
        label="Order Pakai Voucher"
        value={
          <>
            {data.voucher_order_count}{" "}
            <span className="text-sm font-normal text-muted-foreground">Order</span>
          </>
        }
        footer={
          <span className="text-xs text-muted-foreground">
            {data.voucher_order_percentage.toFixed(1)}% dari {data.total_order_count} order
          </span>
        }
      />
      <KpiCard
        icon={PercentIcon}
        iconTone="neutral"
        label="Order Diskon Otomatis"
        value={
          <>
            {data.auto_discount_order_count}{" "}
            <span className="text-sm font-normal text-muted-foreground">Order</span>
          </>
        }
        footer={
          <span className="text-xs text-muted-foreground">
            {data.auto_discount_order_percentage.toFixed(1)}% dari {data.total_order_count} order
          </span>
        }
      />
    </div>
  )
}
