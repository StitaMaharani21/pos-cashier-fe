import type { CardBank } from "@/entities/card-bank/model/card-bank.types"
import type { CardType, PaymentMethod } from "@/entities/payment-method/model/payment-method.types"

// One issuing bank's MDR for debit and credit cards, as typed ("" = no rate of
// its own, the card method's MDR Default applies).
export interface CardBankRateDraft {
  debit: string
  credit: string
}

// Unsaved edits in the detail panel ("Ada perubahan belum disimpan") — the
// card and QRIS settings. Bank / e-wallet accounts are not part of it: they
// save straight from the "Tambah" dialog. The on/off switch saves immediately.
export interface MethodDraft {
  cardTypes: CardType[]
  // MDR Default, kept as the input's string so a half-typed "2." isn't rewritten.
  surcharge: string
  // Issuing bank name → that bank's debit/credit MDR. The banks are the
  // customer's card banks (a fixed list from the backend), NOT the store's own.
  cardBankRates: Record<string, CardBankRateDraft>
  qrisImage: File | null
}

export function channelKey(name: string): string {
  return name.trim().toLowerCase()
}

const rateText = (value: number | null | undefined) => (value == null ? "" : String(value))

export function initialDraft(method: PaymentMethod | undefined, cardBanks: CardBank[]): MethodDraft {
  const cardBankRates: Record<string, CardBankRateDraft> = {}
  for (const bank of cardBanks) {
    cardBankRates[bank.bank] = {
      debit: rateText(bank.debit_mdr_percent),
      credit: rateText(bank.credit_mdr_percent),
    }
  }
  return {
    cardTypes: (method?.card_types ?? []) as CardType[],
    surcharge: method?.mdr_percent ? String(method.mdr_percent) : "",
    cardBankRates,
    qrisImage: null,
  }
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

export function isDraftDirty(draft: MethodDraft, initial: MethodDraft): boolean {
  return (
    !sameSet(draft.cardTypes, initial.cardTypes) ||
    Number(draft.surcharge || 0) !== Number(initial.surcharge || 0) ||
    changedCardBanks(draft.cardBankRates, initial.cardBankRates).length > 0 ||
    draft.qrisImage !== null
  )
}

// Mirrors the backend's account_number check: digits, spaces, "-" and "+", max 50.
export function accountNumberError(value: string): string | null {
  const text = value.trim()
  if (text === "") return null
  if (text.length > 50) return "Maksimal 50 karakter"
  if (!/^[0-9 +-]+$/.test(text)) return "Hanya boleh angka, spasi, tanda - dan +"
  return null
}

// "" and "0" are different (no rate of its own vs deliberately no MDR), but
// "2.5" and "2.50" are the same number.
function sameRate(a: string, b: string): boolean {
  const left = a.trim()
  const right = b.trim()
  if (left === right) return true
  return left !== "" && right !== "" && Number(left) === Number(right)
}

// The banks whose debit or credit rate differs from the saved one — what a save sends.
export function changedCardBanks(
  draft: Record<string, CardBankRateDraft>,
  initial: Record<string, CardBankRateDraft>
): string[] {
  const names = new Set([...Object.keys(draft), ...Object.keys(initial)])
  return [...names].filter((name) => {
    const now = draft[name] ?? { debit: "", credit: "" }
    const before = initial[name] ?? { debit: "", credit: "" }
    return !sameRate(now.debit, before.debit) || !sameRate(now.credit, before.credit)
  })
}

// True when any bank's rate is not a number in 0–100.
export function hasCardBankRateError(draft: MethodDraft): boolean {
  return Object.values(draft.cardBankRates).some(
    (rate) => surchargeError(rate.debit) !== null || surchargeError(rate.credit) !== null
  )
}

// Mirrors the backend's `mdr_percent` binding (gte=0,lte=100).
export function surchargeError(value: string): string | null {
  if (value.trim() === "") return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 100) return "Isi persen antara 0 sampai 100"
  return null
}

// A typed rate as the API wants it: null for blank (the MDR Default applies).
export function rateValue(value: string): number | null {
  const text = value.trim()
  return text === "" ? null : Number(text)
}
