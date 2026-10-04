import { useQuery } from "@tanstack/react-query"

import {
  createRegistrationPayment,
  getRegistrationPayment,
} from "@/modules/public/store-registration/infrastructure/store-registration.api"
import type {
  CheckRegistrationStatusPayload,
  RegistrationPayment,
  RegistrationPaymentStatus,
} from "@/modules/public/store-registration/domain/store-registration.types"
import { ApiError, NetworkError } from "@/shared/api/client"

// How often the open dialog asks whether the QR was paid.
const POLL_MS = 3000

export const FINAL_PAYMENT_STATUSES: RegistrationPaymentStatus[] = ["PAID", "FAILED", "EXPIRED", "CANCELLED"]

export function isFinalPayment(payment: RegistrationPayment | undefined): boolean {
  return payment != null && FINAL_PAYMENT_STATUSES.includes(payment.status)
}

// Asks the backend for the QR when the payment dialog opens. A query keyed by
// `attempt` (not a mutation): the dialog mounts it exactly once per attempt
// even under StrictMode's dev remount — a useMutation observer detached by
// that remount never receives the response — and bumping `attempt` ("Buat QR
// baru") is how a new QR is requested. Safe to repeat: the backend returns
// the still-valid QR (or the paid payment) rather than charging again.
// The password is captured by the closure, never put in the key.
export function useRegistrationPaymentQr(credentials: CheckRegistrationStatusPayload, attempt: number) {
  return useQuery({
    queryKey: ["registration-payment-qr", attempt],
    queryFn: () => createRegistrationPayment(credentials),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

// Polls the payment's status until it reaches a final state. The credentials
// are captured by the closure — the key is the payment id only — and polling
// continues in a background tab (the visitor is usually paying in their bank
// app) but is bounded by the QR's 15-minute lifetime, after which the backend
// reports EXPIRED.
export function useRegistrationPaymentStatus(
  credentials: CheckRegistrationStatusPayload,
  paymentId: number | undefined
) {
  return useQuery({
    queryKey: ["registration-payment", paymentId],
    queryFn: () => getRegistrationPayment({ ...credentials, payment_id: paymentId as number }),
    enabled: paymentId != null,
    refetchInterval: (query) => (isFinalPayment(query.state.data) ? false : POLL_MS),
    refetchIntervalInBackground: true,
    // Don't serve a stale PENDING from a previous open of the dialog.
    gcTime: 0,
  })
}

// Codes come from the backend (subscription_payment / store_registration).
export function paymentErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) return "Tidak dapat terhubung ke server. Coba lagi beberapa saat."
  if (error instanceof ApiError) {
    switch (error.code) {
      case "PAYMENT_PROVIDER_NOT_CONFIGURED":
        return "Pembayaran online belum tersedia saat ini. Pendaftaran kamu tetap tercatat — tim kami akan menghubungi untuk pembayarannya."
      case "PAYMENT_PROVIDER_UNAVAILABLE":
        return "Gagal membuat QR pembayaran. Coba lagi beberapa saat."
      case "INVALID_CREDENTIALS":
        return "Email atau kata sandi tidak cocok dengan pendaftaran ini."
      case "REGISTRATION_NOT_PAYABLE":
        return "Pendaftaran ini sudah diproses, jadi tidak bisa dibayar dari sini. Masuk ke portal untuk membeli paket."
      default:
        return error.message
    }
  }
  return "Pembayaran gagal diproses. Coba lagi."
}
