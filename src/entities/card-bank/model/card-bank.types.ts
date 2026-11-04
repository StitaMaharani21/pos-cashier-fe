// A bank that ISSUES the customer's debit/credit card (pos-kasir-be
// internal/master/card_bank) — not the store's own bank (that is a payment
// channel). The list is fixed on the backend (a catalogue plus "Bank Lainnya");
// the owner only sets each bank's MDR (percent of the grand total) per card type.
// `null` = the bank has no rate of its own, the card method's MDR Default applies;
// `0` = deliberately no MDR. Hand-written: newer than the generated schema.
export interface CardBank {
  bank: string
  debit_mdr_percent: number | null
  credit_mdr_percent: number | null
}

// PUT /master/card-banks replaces the rates of the banks listed (others are
// untouched); null clears a rate.
export type CardBankRate = CardBank
