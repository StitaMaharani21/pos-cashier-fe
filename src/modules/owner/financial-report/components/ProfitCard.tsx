import { CoinsIcon, PercentIcon, PiggyBankIcon, ReceiptTextIcon } from "lucide-react"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useSalesProfit } from "@/modules/owner/financial-report/financial-report.queries"
import { cn, formatNumber, formatRupiah } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"
import { KpiCard } from "@/shared/ui/kpi-card"

// "Laba Kotor" on the Ringkasan. One fixed formula:
//   laba kotor = pendapatan (sebelum pajak) − HPP, where HPP is the cost snapshot
//   saved with each order line when its stock was deducted (bahan baku × harga
//   pokok rata-rata, or the menu's own harga pokok).
// Only orders whose every line has a recorded HPP are counted, so a sale with an
// unknown cost never looks like pure profit; the coverage line says how much of
// the revenue that is.
export function ProfitCard({ from, to }: { from: string; to: string }) {
  const query = useSalesProfit({ from, to })

  if (query.isPending) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-muted/40" />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat laba kotor"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const data = query.data
  const hasCoverage = data.covered_transactions > 0
  const negative = data.gross_profit < 0

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Laba Kotor</h3>
        <p className="text-xs text-muted-foreground">
          Pendapatan sebelum pajak dikurangi modal (HPP) yang tercatat saat stok terpotong. Harga beli yang berubah
          tidak mengubah laporan yang sudah lewat.
        </p>
      </div>

      {hasCoverage ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={ReceiptTextIcon}
            iconTone="neutral"
            label="Pendapatan (ber-HPP)"
            value={formatRupiah(data.covered_revenue)}
            footer={<span className="text-xs text-muted-foreground">Sebelum pajak, setelah diskon</span>}
          />
          <KpiCard
            icon={CoinsIcon}
            iconTone="neutral"
            label="Modal (HPP)"
            value={formatRupiah(data.cogs)}
            footer={<span className="text-xs text-muted-foreground">Bahan baku dan harga pokok menu</span>}
          />
          <KpiCard
            icon={PiggyBankIcon}
            tone={negative ? "warning" : "default"}
            label="Laba Kotor"
            value={formatRupiah(data.gross_profit)}
            footer={<span className="text-xs text-muted-foreground">Pendapatan − modal</span>}
          />
          <KpiCard
            icon={PercentIcon}
            iconTone="neutral"
            label="Margin"
            value={data.margin_pct == null ? "—" : `${formatNumber(data.margin_pct)}%`}
            footer={<span className="text-xs text-muted-foreground">Laba kotor ÷ pendapatan</span>}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          Belum ada penjualan dengan modal (HPP) tercatat pada periode ini. Isi harga beli lewat Riwayat Stok → Ubah Stok →
          Stok Masuk dan resep untuk menu racikan, atau isi Harga Pokok pada menu tanpa resep.
        </p>
      )}

      <p className={cn("text-xs", data.coverage_pct != null && data.coverage_pct < 100 ? "text-foreground" : "text-muted-foreground")}>
        {data.coverage_pct == null
          ? "Belum ada pendapatan pada periode ini."
          : `Modal tercatat untuk ${formatNumber(data.coverage_pct)}% pendapatan (${formatNumber(data.covered_transactions)} dari ${formatNumber(data.total_transactions)} transaksi). Pesanan sebelum pencatatan modal dan menu tanpa resep atau harga pokok tidak ikut dihitung.`}
      </p>
    </Card>
  )
}
