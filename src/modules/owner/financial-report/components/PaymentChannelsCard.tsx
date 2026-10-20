import { BanknoteIcon, CreditCardIcon, LandmarkIcon, QrCodeIcon, SmartphoneIcon, type LucideIcon } from "lucide-react"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useByPaymentMethod } from "@/modules/owner/financial-report/financial-report.queries"
import { groupByChannel } from "@/modules/owner/financial-report/lib/payment-channels"
import { formatRupiah } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

const CHANNEL_ICON: Record<string, LucideIcon> = {
  cash: BanknoteIcon,
  qris: QrCodeIcon,
  card: CreditCardIcon,
  ewallet: SmartphoneIcon,
  transfer: LandmarkIcon,
}

// "Metode Bayar" widget on the Ringkasan: nominal and share per channel
// (Tunai, QRIS, Kartu Debit/Kredit, E-Wallet). Same scope as the cards above
// it (completed orders of the period), so the channels add up to the net
// revenue.
export function PaymentChannelsCard({ from, to }: { from: string; to: string }) {
  const query = useByPaymentMethod({ from, to })

  if (query.isPending) {
    return <div className="h-40 animate-pulse rounded-2xl border bg-muted/40" />
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat metode pembayaran"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const channels = groupByChannel(query.data.items)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <h3 className="text-sm font-semibold text-foreground">Metode Pembayaran</h3>
        <span className="text-sm text-muted-foreground tabular-nums">
          Total {formatRupiah(query.data.total_amount)}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((channel) => {
          const Icon = CHANNEL_ICON[channel.key] ?? BanknoteIcon
          return (
            <div key={channel.key} className="flex flex-col gap-2 rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="flex size-7 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="size-3.5" />
                </span>
                {channel.label}
              </div>
              <p className="text-lg font-bold tracking-tight text-foreground tabular-nums">
                {formatRupiah(channel.amount)}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(Math.max(channel.percentage, 0), 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {channel.percentage.toFixed(1)}% · {channel.count} transaksi
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
