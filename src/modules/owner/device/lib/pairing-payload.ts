import { env } from "@/shared/config/env"

// What the cashier app reads from the pairing QR. It then calls
// POST {api}/devices/claim with header X-Store-Code: store_code and body
// { pairing_token, device_name }, and sends the returned device_token as
// X-Device-Token on the PIN login and every request after it.
export interface PairingPayload {
  v: 1
  store_code: string
  pairing_token: string
  api: string
}

// Absolute API URL the cashier device should call (see env.cashierApiUrl).
export function cashierApiUrl(): string {
  const raw = env.cashierApiUrl ?? env.apiBaseUrl
  try {
    return new URL(raw, window.location.origin).toString().replace(/\/+$/, "")
  } catch {
    return raw
  }
}

// A phone can't reach the owner's own machine through these names.
export function isLocalOnlyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost")
  } catch {
    return false
  }
}

export function buildPairingPayload(storeCode: string, pairingToken: string): string {
  const payload: PairingPayload = { v: 1, store_code: storeCode, pairing_token: pairingToken, api: cashierApiUrl() }
  return JSON.stringify(payload)
}
