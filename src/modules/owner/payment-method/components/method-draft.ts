import type {
  CardNetwork,
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
  cardNetworks: CardNetwork[]
  // Kept as the input's string so a half-typed "2." isn't rewritten.
  surcharge: string
  // Channel name (lower-cased) → should be active.
  channels: Record<string, boolean>
  qrisImage: File | null
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
  for (const option of channelOptions(type, channels)) {
    channelState[channelKey(option.name)] = option.channel?.status === "active"
  }
  return {
    cardTypes: (method?.card_types ?? []) as CardType[],
    cardNetworks: (method?.card_networks ?? []) as CardNetwork[],
    surcharge: method?.credit_surcharge_percent ? String(method.credit_surcharge_percent) : "",
    channels: channelState,
    qrisImage: null,
  }
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

export function isDraftDirty(draft: MethodDraft, initial: MethodDraft): boolean {
  return (
    !sameSet(draft.cardTypes, initial.cardTypes) ||
    !sameSet(draft.cardNetworks, initial.cardNetworks) ||
    Number(draft.surcharge || 0) !== Number(initial.surcharge || 0) ||
    Object.keys(draft.channels).some((key) => draft.channels[key] !== initial.channels[key]) ||
    draft.qrisImage !== null
  )
}

// Mirrors the backend's `credit_surcharge_percent` binding (gte=0,lte=100).
export function surchargeError(value: string): string | null {
  if (value.trim() === "") return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 100) return "Isi angka 0–100"
  return null
}
