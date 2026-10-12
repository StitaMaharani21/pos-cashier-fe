// Shared by every public page (landing, store registration).

// Same env var the owner upsell modal uses (shared/access/upsellContent.ts).
// True only once the real production number is set — read this before
// treating a wa.me link as trustworthy; see SALES_WA below.
export const SALES_WA_CONFIGURED = Boolean(import.meta.env.VITE_SALES_WA)

// PLACEHOLDER, not a real sales line — unset in this repo's .env (confirmed:
// grep found nothing). Every WhatsApp CTA on the public pages still needs
// *some* number to build a valid wa.me URL in dev, so this keeps the link
// clickable rather than dead; it must not reach production. Set
// VITE_SALES_WA before launch — until then this logs a console warning once
// per session so the gap isn't silent.
const SALES_WA_PLACEHOLDER = "6281263352767"
const SALES_WA = (import.meta.env.VITE_SALES_WA as string | undefined) || SALES_WA_PLACEHOLDER

if (!SALES_WA_CONFIGURED && import.meta.env.DEV) {
  console.warn(
    "[Neela] VITE_SALES_WA is not set — WhatsApp CTAs are using a placeholder number. Set it before deploying."
  )
}

export function waLink(message: string): string {
  return `https://wa.me/${SALES_WA}?text=${encodeURIComponent(message)}`
}

// Shared by PricingSection's PlanCtaLink (public landing) and the owner
// console's billing/PlanComparisonGrid — one message template so the two
// surfaces never silently diverge.
export function ownerPlanInquiryMessage(planName: string): string {
  return `Halo Neela POS, saya pemilik toko dan ingin tanya soal paket ${planName}`
}

export const SUPPORT_HOURS = "07.00–24.00 WIB"

// Brand name only — the legal entity (CV vs PT) and the official address
// aren't settled yet; add them here once they are.
export const COPYRIGHT_HOLDER = "NeelaPOS"

// Public self-service store registration page (modules/public/store-registration).
export const REGISTER_PATH = "/daftar"

// Where an owner who registered (but has no account until approval) checks
// whether the request was approved.
export const REGISTRATION_STATUS_PATH = "/status-pendaftaran"
