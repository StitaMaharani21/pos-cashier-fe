import type {
  CardNetwork,
  CardType,
  PaymentMethodType,
} from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannelType } from "@/entities/payment-channel/model/payment-channel.types"

// The screen manages exactly one payment method per type — these five, in
// this order. `name` is what's saved as the method's name (what the cashier
// app shows).
export const METHOD_TYPES: {
  type: PaymentMethodType
  name: string
  description: string
}[] = [
  { type: "cash", name: "Tunai (Cash)", description: "Pembayaran uang tunai di kasir" },
  { type: "card", name: "Kartu Debit / Kredit", description: "Terima pembayaran kartu debit dan kredit" },
  { type: "transfer", name: "Transfer Bank", description: "Terima transfer ke rekening bank" },
  { type: "ewallet", name: "E-Wallet", description: "Terima pembayaran dompet digital" },
  { type: "qris", name: "QRIS", description: "Satu kode QR untuk semua aplikasi pembayaran" },
]

// Which payment_channel list a method type draws from — card and transfer
// share the bank list (pos-kasir-be payment_service.go expectedChannelType).
export const CHANNEL_TYPE_FOR: Partial<Record<PaymentMethodType, PaymentChannelType>> = {
  card: "bank",
  transfer: "bank",
  ewallet: "ewallet",
}

export const CARD_TYPE_OPTIONS: { value: CardType; label: string }[] = [
  { value: "debit", label: "Debit Card" },
  { value: "credit", label: "Credit Card" },
]

export const CARD_NETWORK_OPTIONS: { value: CardNetwork; label: string }[] = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "gpn", label: "GPN" },
  { value: "jcb", label: "JCB" },
  { value: "amex", label: "American Express" },
  { value: "unionpay", label: "UnionPay" },
]

// Suggested channels, offered as ready-made checkboxes; channels the store
// already has under other names show up next to these (see ChannelConfigPanel).
export const BANK_PROVIDERS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "BSI",
  "CIMB Niaga",
  "Permata",
  "Danamon",
  "BTN",
  "OCBC",
  "Bank Jago",
  "SeaBank",
  "blu by BCA Digital",
] as const

export const EWALLET_PROVIDERS = [
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "LinkAja",
  "AstraPay",
  "i.saku",
] as const
