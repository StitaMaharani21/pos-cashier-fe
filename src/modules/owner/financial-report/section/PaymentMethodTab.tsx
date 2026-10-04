import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useByPaymentMethod } from "@/modules/owner/financial-report/financial-report.queries"
import { formatRupiah } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

// "Metode Pembayaran" tab — a horizontal-bar list rather than a CrudTable;
// with typically only a handful of payment methods, a bar-per-row reads
// faster than a dense table for "which method dominates" at a glance.
export function PaymentMethodTab({ from, to }: { from: string; to: string }) {
  const query = useByPaymentMethod({ from, to })

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data metode pembayaran"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const { items, total_amount } = query.data

  if (items.length === 0) {
    return (
      <ReportStateCard
        title="Belum ada transaksi pada periode ini"
        hint="Coba pilih rentang tanggal yang lain."
      />
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <h3 className="text-sm font-semibold text-foreground">Rincian per Metode Pembayaran</h3>
        <span className="text-sm text-muted-foreground">
          Total {formatRupiah(total_amount)}
        </span>
      </div>
      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.payment_method_id} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatRupiah(item.total_amount)} · {item.transaction_count} transaksi
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
