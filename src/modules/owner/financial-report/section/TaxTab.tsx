import { PercentIcon, ReceiptIcon, SettingsIcon, WalletIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { KpiSkeletonGrid } from "@/modules/owner/financial-report/components/KpiSkeletonGrid"
import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useTaxSummary } from "@/modules/owner/financial-report/financial-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { KpiCard } from "@/shared/ui/kpi-card"

// "Pajak" tab — three simple KPIs off GET /reports/sales/tax. Unlike every
// other tab's "no transactions" empty state, tax_percentage === 0 almost
// always means the store simply hasn't configured a tax rate yet (rather
// than "no tax collected this period") — so that case gets its own
// informational empty state pointing at Pengaturan Bisnis, instead of a
// confusing Rp0 card sitting next to a real transaction count.
export function TaxTab({ from, to }: { from: string; to: string }) {
  const query = useTaxSummary({ from, to })

  if (query.isPending) {
    return <KpiSkeletonGrid count={3} />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data pajak"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const data = query.data

  if (data.tax_percentage === 0) {
    return (
      <ReportStateCard
        icon={SettingsIcon}
        title="Toko belum mengatur tarif pajak"
        hint="Atur tarif pajak di Pengaturan Bisnis agar laporan ini bisa menghitung pajak yang terkumpul."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/business-settings">Atur di Pengaturan Bisnis</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        icon={WalletIcon}
        label="Total Pajak Terkumpul"
        value={formatRupiah(data.total_tax_collected)}
      />
      <KpiCard
        icon={PercentIcon}
        iconTone="neutral"
        label="Tarif Pajak Saat Ini"
        value={`${data.tax_percentage}%`}
      />
      <KpiCard
        icon={ReceiptIcon}
        iconTone="neutral"
        label="Jumlah Transaksi"
        value={
          <>
            {data.total_transactions}{" "}
            <span className="text-sm font-normal text-muted-foreground">Order</span>
          </>
        }
      />
    </div>
  )
}
