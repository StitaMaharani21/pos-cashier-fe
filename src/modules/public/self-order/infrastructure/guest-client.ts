import axios, { type AxiosError } from "axios"

import { ApiError, NetworkError, type ApiErrorPayload } from "@/shared/api/client"
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
        return Promise.reject(new NetworkError("Tidak dapat terhubung ke server."))
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

export function guestErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) return "Periksa koneksi internet kamu, lalu coba lagi."
  if (error instanceof ApiError) return error.message
  return "Terjadi kesalahan. Coba lagi."
}
