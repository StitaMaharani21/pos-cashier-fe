import { env } from "@/shared/config/env"

// The customer self-order page lives at modules/public/self-order; the owner's
// table QR (modules/owner/table) encodes a link to it. Both sides need the
// path, and modules/owner and modules/public must not import each other, so it
// sits here.
export const SELF_ORDER_ROUTE = "/pesan/:storeCode/:qrToken"

// Every /api/v1 call needs X-Store-Code, so the store code travels in the link
// next to the table session's QR token.
export function buildSelfOrderUrl(storeCode: string, qrToken: string): string {
  const origin = (env.publicAppUrl ?? window.location.origin).replace(/\/+$/, "")
  return `${origin}/pesan/${encodeURIComponent(storeCode)}/${encodeURIComponent(qrToken)}`
}
