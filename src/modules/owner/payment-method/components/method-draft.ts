import type {
  CardType,
  PaymentMethod,
  PaymentMethodType,
} from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import {
  BANK_PROVIDERS,
  CHANNEL_TYPE_FOR,
  EWALLET_PROVIDERS,
} from "@/modules/owner/payment-method/constants/payment-providers"

// Unsaved edits in the detail panel ("Ada perubahan belum disimpan").
// The on/off switch is NOT part of it — that saves immediately.
export interface MethodDraft {
  cardTypes: CardType[]
  // MDR Default, kept as the input's string so a half-typed "2." isn't rewritten.
  surcharge: string
  // Channel name (lower-cased) → should be active.
  channels: Record<string, boolean>
  // Bank name (lower-cased) → that bank's own MDR override, as typed.
  // "" = no override (MDR Default applies).
  bankSurcharges: Record<string, string>
  // Channel name (lower-cased) → the store's account number (bank) / phone
  // number (e-wallet) and holder name, as typed. "" = not filled in.
  channelAccounts: Record<string, ChannelAccount>
  qrisImage: File | null
}

export interface ChannelAccount {
  number: string
  name: string
}

export function channelKey(name: string): string {
  return name.trim().toLowerCase()
}

// Channels of the list this method type uses — "transfer" (and "card") show
// banks, "ewallet" e-wallets. Presets first, then any the store already has
// under other names, each with its current state.
export function channelOptions(type: PaymentMethodType, channels: PaymentChannel[]) {
  const channelType = CHANNEL_TYPE_FOR[type]
  if (!channelType) return []
  const presets: readonly string[] = channelType === "bank" ? BANK_PROVIDERS : EWALLET_PROVIDERS
  const own = channels.filter((channel) => channel.type === channelType)
  const names = [...presets]
  for (const channel of own) {
    if (channel.name && !names.some((name) => channelKey(name) === channelKey(channel.name ?? ""))) {
      names.push(channel.name)
    }
  }
  return names.map((name) => ({
    name,
    channel: own.find((channel) => channelKey(channel.name ?? "") === channelKey(name)),
  }))
}

export function initialDraft(
  type: PaymentMethodType,
  method: PaymentMethod | undefined,
  channels: PaymentChannel[]
): MethodDraft {
  const channelState: Record<string, boolean> = {}
  const channelAccounts: Record<string, ChannelAccount> = {}
  for (const option of channelOptions(type, channels)) {
    const key = channelKey(option.name)
    channelState[key] = option.channel?.status === "active"
    channelAccounts[key] = {
      number: option.channel?.account_number ?? "",
      name: option.channel?.account_name ?? "",
    }
  }
  const bankSurcharges: Record<string, string> = {}
  for (const channel of channels) {
    if (channel.type === "bank" && channel.mdr_percent != null) {
      bankSurcharges[channelKey(channel.name ?? "")] = String(channel.mdr_percent)
    }
  }
  return {
    cardTypes: (method?.card_types ?? []) as CardType[],
    surcharge: method?.mdr_percent ? String(method.mdr_percent) : "",
    channels: channelState,
    bankSurcharges,
    channelAccounts,
    qrisImage: null,
  }
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

export function isDraftDirty(draft: MethodDraft, initial: MethodDraft): boolean {
  return (
    !sameSet(draft.cardTypes, initial.cardTypes) ||
    Number(draft.surcharge || 0) !== Number(initial.surcharge || 0) ||
    Object.keys(draft.channels).some((key) => draft.channels[key] !== initial.channels[key]) ||
    bankSurchargesChanged(draft.bankSurcharges, initial.bankSurcharges) ||
    channelAccountsChanged(draft.channelAccounts, initial.channelAccounts) ||
    draft.qrisImage !== null
  )
}

function channelAccountsChanged(
  a: Record<string, ChannelAccount>,
  b: Record<string, ChannelAccount>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if ((a[key]?.number ?? "").trim() !== (b[key]?.number ?? "").trim()) return true
    if ((a[key]?.name ?? "").trim() !== (b[key]?.name ?? "").trim()) return true
  }
  return false
}

// Mirrors the backend's account_number check: digits, spaces, "-" and "+", max 50.
export function accountNumberError(value: string): string | null {
  const text = value.trim()
  if (text === "") return null
  if (text.length > 50) return "Maksimal 50 karakter"
  if (!/^[0-9 +-]+$/.test(text)) return "Hanya angka, spasi, - dan +"
  return null
}

// True when any selected channel's number is invalid.
export function hasChannelAccountError(draft: MethodDraft): boolean {
  return Object.entries(draft.channelAccounts).some(
    ([key, account]) => (draft.channels[key] ?? false) && accountNumberError(account.number) !== null
  )
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
  if (!Number.isFinite(number) || number < 0 || number > 100) return "Isi angka 0–100"
  return null
}
