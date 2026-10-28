import type { CardType, PaymentMethod } from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"

// Unsaved edits in the detail panel ("Ada perubahan belum disimpan") — the
// card and QRIS settings. Bank / e-wallet accounts are not part of it: they
// save straight from the "Tambah" dialog. The on/off switch saves immediately.
export interface MethodDraft {
  cardTypes: CardType[]
  // MDR Default, kept as the input's string so a half-typed "2." isn't rewritten.
  surcharge: string
  // Bank name (lower-cased) → that bank's own MDR override, as typed.
  // "" = no override (MDR Default applies).
  bankSurcharges: Record<string, string>
  qrisImage: File | null
}

export function channelKey(name: string): string {
  return name.trim().toLowerCase()
}

export function initialDraft(method: PaymentMethod | undefined, channels: PaymentChannel[]): MethodDraft {
  const bankSurcharges: Record<string, string> = {}
  for (const channel of channels) {
    if (channel.type === "bank" && channel.mdr_percent != null) {
      bankSurcharges[channelKey(channel.name ?? "")] = String(channel.mdr_percent)
    }
  }
  return {
    cardTypes: (method?.card_types ?? []) as CardType[],
    surcharge: method?.mdr_percent ? String(method.mdr_percent) : "",
    bankSurcharges,
    qrisImage: null,
  }
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

export function isDraftDirty(draft: MethodDraft, initial: MethodDraft): boolean {
  return (
    !sameSet(draft.cardTypes, initial.cardTypes) ||
    Number(draft.surcharge || 0) !== Number(initial.surcharge || 0) ||
    bankSurchargesChanged(draft.bankSurcharges, initial.bankSurcharges) ||
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

function bankSurchargesChanged(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const left = (a[key] ?? "").trim()
    const right = (b[key] ?? "").trim()
    if (left === right) continue
    if (left !== "" && right !== "" && Number(left) === Number(right)) continue
    return true
  }
  return false
}

// True when any bank's own fee is not a number in 0–100.
export function hasBankSurchargeError(draft: MethodDraft): boolean {
  return Object.values(draft.bankSurcharges).some((value) => surchargeError(value) !== null)
}

// Mirrors the backend's `mdr_percent` binding (gte=0,lte=100).
export function surchargeError(value: string): string | null {
  if (value.trim() === "") return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 100) return "Isi persen antara 0 sampai 100"
  return null
}
