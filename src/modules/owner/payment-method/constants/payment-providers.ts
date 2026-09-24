import type { PaymentMethodType } from "@/entities/payment-method/model/payment-method.types"

// The backend only stores a free-text `name` per payment method (no provider
// column) — these fixed lists are what the form offers instead of letting the
// owner type it, so names stay consistent ("GoPay", not "gopay"/"Go-Pay").
// Stored plain ("BCA", not "Transfer BCA"): the type icon already tells the
// two apart in the table.
export const EWALLET_PROVIDERS = [
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "LinkAja",
  "AstraPay",
  "i.saku",
] as const

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

export const CARD_OPTIONS = ["Kartu Debit", "Kartu Kredit"] as const

// Types with exactly one sensible name — the form fills it in and hides the
// provider picker.
export const FIXED_NAME: Partial<Record<PaymentMethodType, string>> = {
  cash: "Tunai",
  qris: "QRIS",
}

export const PROVIDER_LABEL: Partial<Record<PaymentMethodType, string>> = {
  ewallet: "Pilih E-Wallet",
  transfer: "Pilih Bank",
  card: "Jenis Kartu",
}

export function providerOptions(type: PaymentMethodType): readonly string[] | null {
  switch (type) {
    case "ewallet":
      return EWALLET_PROVIDERS
    case "transfer":
      return BANK_PROVIDERS
    case "card":
      return CARD_OPTIONS
    default:
      return null
  }
}
