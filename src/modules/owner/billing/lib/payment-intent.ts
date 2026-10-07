import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import type { AddonCatalogItem, SubscriptionPlan } from "@/entities/subscription/model/subscription.types"

// What the payment dialog is about to buy. Everything shown comes from the
// backend's catalogue rows carried in here; the amount charged is whatever the
// backend answers when the payment is created.
export type PaymentIntent =
  | {
      kind: "plan"
      plan: SubscriptionPlan
      // Display names; "starter" etc. are mapped by the caller.
      planName: string
      currentPlanName: string
      // "upgrade" = a higher plan than the current one; "renew" = the same plan.
      mode: "upgrade" | "renew"
      // RFC3339 end of the current subscription, when the backend records one.
      renewAt?: string
    }
  | {
      kind: "addon"
      addon: AddonCatalogItem
      qty: number
    }

export function formatDay(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "" : format(date, "d MMMM yyyy", { locale: localeId })
}

export function isFuture(iso?: string): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && t > Date.now()
}

export function intentTitle(intent: PaymentIntent): string {
  if (intent.kind === "plan") {
    return intent.mode === "upgrade" ? `Upgrade ke ${intent.planName}` : `Perpanjang ${intent.planName}`
  }
  return intent.addon.per_unit ? `${intent.addon.name} × ${intent.qty}` : intent.addon.name
}

// Backend price × units, for the confirm step only (the QR amount is the
// backend's own figure and is what the payment screen shows afterwards).
export function intentEstimate(intent: PaymentIntent): number {
  if (intent.kind === "plan") return intent.plan.price
  return intent.addon.price * (intent.addon.per_unit ? intent.qty : 1)
}

export function intentDays(intent: PaymentIntent): number {
  return intent.kind === "plan" ? intent.plan.duration_days : intent.addon.duration_days
}

// The warning/explanation lines shown before paying. The upgrade case is the
// one that costs the owner something: pos-kasir-be does not prorate, so the
// days left on the current plan are lost.
export function intentNotes(intent: PaymentIntent): string[] {
  const days = intentDays(intent)

  if (intent.kind === "plan") {
    if (intent.mode === "renew") {
      return intent.renewAt && isFuture(intent.renewAt)
        ? [`Masa aktif ${intent.planName} bertambah ${days} hari dari ${formatDay(intent.renewAt)}.`]
        : [`Masa aktif ${intent.planName} ${days} hari dihitung mulai hari ini.`]
    }
    const notes = [`Masa aktif ${intent.planName} ${days} hari dihitung mulai hari ini, setelah pembayaran diterima.`]
    notes.push(
      isFuture(intent.renewAt)
        ? `Paket ${intent.currentPlanName} Anda aktif sampai ${formatDay(intent.renewAt)}. Sisa harinya tidak dihitung ke paket baru dan hangus.`
        : `Sisa masa aktif paket ${intent.currentPlanName} (jika ada) tidak dihitung ke paket baru dan hangus.`
    )
    return notes
  }

  const { addon, qty } = intent
  if (addon.per_unit) {
    return [
      `${qty} device tambahan aktif ${days} hari mulai setelah pembayaran diterima.`,
      "Setelah masa aktif habis, kuota kembali ke batas paket. Perangkat yang sudah terpasang tetap berjalan, tetapi memasang perangkat baru dibatasi sampai Anda membeli lagi.",
    ]
  }
  return addon.active_until && isFuture(addon.active_until)
    ? [`Masa aktif ${addon.name} bertambah ${days} hari dari ${formatDay(addon.active_until)}.`]
    : [`${addon.name} aktif ${days} hari mulai setelah pembayaran diterima.`]
}
