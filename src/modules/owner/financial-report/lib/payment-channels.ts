import type { PaymentMethodBreakdownItem } from "@/modules/owner/financial-report/financial-report.types"

// Payment methods merged into the channels shown on the Ringkasan: the owner
// names methods freely ("QRIS BCA", "Kartu Debit / Kredit"), so grouping is by
// the method's type — Tunai, QRIS, Kartu Debit/Kredit, E-Wallet (plus Transfer
// Bank when used).
export interface PaymentChannelTotal {
  key: string
  label: string
  amount: number
  count: number
  // Share of the whole period's payments, 0..100.
  percentage: number
}

const MAIN_CHANNELS = [
  { key: "cash", label: "Tunai" },
  { key: "qris", label: "QRIS" },
  { key: "card", label: "Kartu Debit/Kredit" },
  { key: "ewallet", label: "E-Wallet" },
] as const

const OPTIONAL_CHANNELS: Record<string, string> = {
  transfer: "Transfer Bank",
}

// The four main channels are always listed (zero when unused) so the widget
// keeps one shape from period to period; Transfer Bank and any unknown type
// only appear once they have payments.
export function groupByChannel(items: PaymentMethodBreakdownItem[]): PaymentChannelTotal[] {
  const totals = new Map<string, { label: string; amount: number; count: number }>()
  for (const channel of MAIN_CHANNELS) {
    totals.set(channel.key, { label: channel.label, amount: 0, count: 0 })
  }

  for (const item of items) {
    const key = item.payment_method_type || item.name
    const label =
      MAIN_CHANNELS.find((channel) => channel.key === key)?.label ?? OPTIONAL_CHANNELS[key] ?? item.name
    const current = totals.get(key) ?? { label, amount: 0, count: 0 }
    totals.set(key, {
      label: current.label,
      amount: current.amount + item.total_amount,
      count: current.count + item.transaction_count,
    })
  }

  const grandTotal = [...totals.values()].reduce((sum, channel) => sum + channel.amount, 0)
  return [...totals.entries()]
    .filter(([key, channel]) => MAIN_CHANNELS.some((main) => main.key === key) || channel.amount > 0)
    .map(([key, channel]) => ({
      key,
      ...channel,
      percentage: grandTotal > 0 ? (channel.amount / grandTotal) * 100 : 0,
    }))
}
