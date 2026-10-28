import orderScreen from "@/assets/landing/order-screen.webp"
import payCash from "@/assets/landing/pay-cash.webp"
import payQris from "@/assets/landing/pay-qris.webp"
import shiftStart from "@/assets/landing/shift-start.webp"
import type { CmsMedia } from "@/modules/public/shared/cms/cms.types"

// cms_media.url = "bundle:<name>" marks an image that still ships inside the
// app bundle (Vite hashes the file name, so the CMS can't hold its real URL).
// Replacing it in the CMS with an uploaded image (an https URL) takes over.
const BUNDLED: Record<string, string> = {
  "order-screen": orderScreen,
  "pay-cash": payCash,
  "pay-qris": payQris,
  "shift-start": shiftStart,
}

const BUNDLE_PREFIX = "bundle:"

// undefined = unresolvable (unknown bundle name): the caller keeps its fallback.
export function resolveMediaSrc(media: Pick<CmsMedia, "url">): string | undefined {
  if (media.url.startsWith(BUNDLE_PREFIX)) return BUNDLED[media.url.slice(BUNDLE_PREFIX.length)]
  // Only http(s) URLs: the CMS is trusted, but a javascript:/data: URL in an
  // <img src> is never wanted.
  return /^https?:\/\//i.test(media.url) ? media.url : undefined
}
