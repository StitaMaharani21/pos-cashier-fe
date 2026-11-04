import type { ReportTransaction } from "@/modules/owner/financial-report/financial-report.types"

// Detailed payment label for the transaction table and detail drawer:
// category plus the provider/bank behind it, e.g. "E-Wallet (GoPay)",
// "Debit (BCA)", "Transfer (BCA)", "QRIS", "Tunai".
//
// Built from structured fields rather than the free-text method name so it
// stays consistent however the owner named the method. The bank/e-wallet
// comes from the payment's channel (transfer/e-wallet — the backend stores no
// bank for QRIS or cash). A card shows the bank that ISSUED the customer's card
// (`cardBank`, the basis of its MDR), falling back to the channel for payments
// recorded before that existed. A QRIS is just "QRIS" — dynamic vs static is not
// something the owner needs to tell apart here.
export interface PaymentLabelInput {
  type?: string
  name?: string
  channel?: string
  cardBank?: string
  cardType?: string
  provider?: string
}

function withDetail(label: string, detail?: string) {
  return detail ? `${label} (${detail})` : label
}

export function formatPaymentLabel({ type, name, channel, cardBank, cardType }: PaymentLabelInput): string {
  switch (type) {
    case "cash":
      return "Tunai"
    case "ewallet":
      return withDetail("E-Wallet", channel)
    case "transfer":
      return withDetail("Transfer", channel)
    case "card": {
      const kind = cardType === "credit" ? "Kredit" : cardType === "debit" ? "Debit" : "Kartu Debit / Kredit"
      return withDetail(kind, cardBank || channel)
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
    cardBank: row.card_bank,
    cardType: row.card_type,
    provider: row.payment_provider,
  })
}
