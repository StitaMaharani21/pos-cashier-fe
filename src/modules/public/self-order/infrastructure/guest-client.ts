import axios, { type AxiosError } from "axios"

import { ApiError, NetworkError, type ApiErrorPayload } from "@/shared/api/client"
import { friendlyErrorMessage } from "@/shared/api/error-message"
import { env } from "@/shared/config/env"

// Who is calling: the store comes from the QR link, the guest token from
// resolving the table's QR token.
export interface GuestContext {
  storeCode: string
  guestToken?: string
}

// Deliberately NOT apiClient: that one attaches the owner's token and store
// code when an owner session happens to sit in localStorage, and its response
// interceptor logs the owner out on 401, opens the upsell modal on 402 and
// toasts on 403 — all wrong for a customer's phone.
export function createGuestClient({ storeCode, guestToken }: GuestContext) {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: { "X-Store-Code": storeCode, ...(guestToken ? { "X-Guest-Token": guestToken } : {}) },
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorPayload | { error?: string }>) => {
      if (!error.response) {
        return Promise.reject(new NetworkError("Tidak bisa terhubung. Periksa koneksi internet kamu."))
      }
      const { status, data } = error.response
      // The outer dispatcher answers an unknown X-Store-Code with a bare 404.
      if (status === 404 && (data as { error?: string } | undefined)?.error === "unknown_store") {
        return Promise.reject(new ApiError({ code: "UNKNOWN_STORE", message: "Toko tidak ditemukan." }, status))
      }
      // RequirePlan(Pro) aborts with a flat {code} and no message.
      if (status === 402) {
        return Promise.reject(
          new ApiError({ code: "FEATURE_NOT_IN_PLAN", message: "Pesan dari meja belum tersedia di toko ini." }, status)
        )
      }
      const payload = data as Partial<ApiErrorPayload> | undefined
      // A 5xx is the server's problem whatever its body says (e.g. an
      // unmapped error comes back as a generic INTERNAL): one code so the
      // screens can say so, instead of echoing "Internal server error".
      if (status >= 500) {
        return Promise.reject(new ApiError({ code: "SERVER_ERROR", message: "Sedang ada gangguan." }, status))
      }
      if (payload?.code && payload.message) {
        return Promise.reject(new ApiError({ code: payload.code, message: payload.message }, status))
      }
      return Promise.reject(new ApiError({ code: "UNKNOWN", message: "Terjadi kesalahan. Coba lagi." }, status))
    }
  )

  return client
}

// The table's session is gone: unknown/expired QR token, closed by the
// cashier, or a guest token the server no longer accepts.
export function isSessionGone(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)
}

// Backend error codes → copy for a customer. Anything else shows the
// backend's own message.
export function guestErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) return "Periksa koneksi internet kamu, lalu coba lagi."
  if (error instanceof ApiError) {
    switch (error.code) {
      case "NO_ACTIVE_SHIFT":
        return "Kasir belum buka. Minta bantuan staf."
      case "DINE_IN_DISABLED":
        return "Pemesanan dari meja sedang dinonaktifkan. Silakan pesan langsung ke kasir."
      case "TABLE_INACTIVE":
        return "Meja ini sedang tidak menerima pesanan. Minta bantuan staf."
      case "TABLE_HAS_PENDING_ORDER":
        return "Pesanan sebelumnya di meja ini masih menunggu kasir. Coba lagi sebentar."
      case "RATE_LIMITED":
        return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."
      case "QTY_LIMIT":
        return "Jumlah pesanan melebihi batas. Kurangi jumlahnya atau panggil staf."
      case "SERVER_ERROR":
        return "Sedang ada gangguan. Coba lagi sebentar lagi."
      default:
        return friendlyErrorMessage(error)
    }
  }
  return "Terjadi kesalahan. Coba lagi."
}
