import type { ReportTransaction } from "@/modules/owner/financial-report/financial-report.types"

// Detailed payment label for the transaction table and detail drawer:
// category plus the provider/bank behind it, e.g. "E-Wallet (GoPay)",
// "Debit (BCA)", "Transfer (BCA)", "QRIS", "Tunai".
//
// Built from structured fields rather than the free-text method name so it
// stays consistent however the owner named the method. The bank/e-wallet
// comes from the payment's channel (card/transfer/e-wallet only — the backend
// stores no bank for QRIS or cash); a QRIS is just "QRIS" — dynamic vs static is
// not something the owner needs to tell apart here.
export interface PaymentLabelInput {
  type?: string
  name?: string
  channel?: string
  cardType?: string
  provider?: string
}

function withDetail(label: string, detail?: string) {
  return detail ? `${label} (${detail})` : label
}

export function formatPaymentLabel({ type, name, channel, cardType }: PaymentLabelInput): string {
  switch (type) {
    case "cash":
      return "Tunai"
    case "ewallet":
      return withDetail("E-Wallet", channel)
    case "transfer":
      return withDetail("Transfer", channel)
    case "card": {
      const kind = cardType === "credit" ? "Kredit" : cardType === "debit" ? "Debit" : "Kartu Debit / Kredit"
      return withDetail(kind, channel)
    }
    case "qris":
      return "QRIS"
    default:
      // Unknown or future types fall back to the name the owner gave the method.
      return name || "—"
  }
}

// Label of a transaction-table row (also used by the detail drawer header).
export function paymentLabelOfRow(row: ReportTransaction): string {
  return formatPaymentLabel({
    type: row.payment_method_type,
    name: row.payment_method_name,
    channel: row.payment_channel_name,
    cardType: row.card_type,
    provider: row.payment_provider,
  })
}
