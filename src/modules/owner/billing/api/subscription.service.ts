import type {
  AddonCatalogItem,
  CurrentSubscription,
  SubscriptionPayment,
  SubscriptionPlan,
} from "@/entities/subscription/model/subscription.types"
import { ApiError, apiClient } from "@/shared/api/client"
import type { SingleResponse } from "@/shared/api/crud/types"

// pos-kasir-be internal/central/subscription_payment — owner-only (JWT owner),
// under /api/v1/subscriptions. Prices and durations always come from the
// backend's catalogues; the request only names what to buy.

export const SUBSCRIPTION_KEY = ["subscription"] as const

export async function listPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get<SingleResponse<SubscriptionPlan[]>>("/subscriptions/plans")
  return response.data.data ?? []
}

export async function getCurrentSubscription(): Promise<CurrentSubscription> {
  const response = await apiClient.get<SingleResponse<CurrentSubscription>>("/subscriptions/current")
  const current = response.data.data
  return { ...current, addons: current.addons ?? [] }
}

export async function listAddonCatalog(): Promise<AddonCatalogItem[]> {
  const response = await apiClient.get<SingleResponse<AddonCatalogItem[]>>("/subscriptions/addons")
  return response.data.data ?? []
}

// A new PENDING payment + QRIS, or the still-valid one for the same item.
export async function createPlanPayment(planId: number): Promise<SubscriptionPayment> {
  const response = await apiClient.post<SingleResponse<SubscriptionPayment>>("/subscriptions/payments", {
    plan_id: planId,
  })
  return response.data.data
}

export async function createAddonPayment(addonCode: string, qty: number): Promise<SubscriptionPayment> {
  const response = await apiClient.post<SingleResponse<SubscriptionPayment>>("/subscriptions/addon-payments", {
    addon_code: addonCode,
    qty,
  })
  return response.data.data
}

export async function getPayment(paymentId: number): Promise<SubscriptionPayment> {
  const response = await apiClient.get<SingleResponse<SubscriptionPayment>>(`/subscriptions/payments/${paymentId}`)
  return response.data.data
}

// Backend error codes → Indonesian copy. Anything else shows the backend's
// message (or a generic one for a network failure).
export function paymentErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "PAYMENT_PROVIDER_NOT_CONFIGURED":
        return "Pembayaran online belum tersedia saat ini. Hubungi tim Neela untuk membeli lewat WhatsApp."
      case "PAYMENT_PROVIDER_UNAVAILABLE":
        return "Gagal membuat QR pembayaran. Coba lagi beberapa saat."
      case "PLAN_DOWNGRADE_NOT_ALLOWED":
        return "Paket yang dipilih lebih rendah dari paket Anda saat ini."
      case "PLAN_NOT_PURCHASABLE":
      case "PLAN_NOT_FOUND":
        return "Paket ini belum bisa dibeli sendiri. Hubungi tim Neela."
      case "ADDON_NOT_PURCHASABLE":
      case "ADDON_NOT_FOUND":
        return "Add-on ini belum bisa dibeli sendiri. Hubungi tim Neela."
      case "ADDON_INCLUDED_IN_PLAN":
        return "Add-on ini sudah termasuk di paket Anda."
      case "ADDON_ALREADY_ACTIVE":
        return "Add-on ini sudah aktif tanpa batas waktu."
      case "INVALID_QTY":
        return "Jumlah harus antara 1 dan 10."
      default:
        return error.message
    }
  }
  return "Terjadi kesalahan. Coba lagi."
}
