const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not set — copy .env.example to .env and fill it in."
  )
}

// The API address written into the cashier-device pairing QR. The cashier's
// phone/tablet must reach it on its own, so a dashboard running against
// `localhost` needs this set to the LAN/public address (e.g. the ngrok URL).
// Falls back to VITE_API_BASE_URL, resolved against this page's origin.
const cashierApiUrl = (import.meta.env.VITE_CASHIER_API_URL as string | undefined)?.trim() || undefined

export const env = {
  apiBaseUrl,
  cashierApiUrl,
} as const
