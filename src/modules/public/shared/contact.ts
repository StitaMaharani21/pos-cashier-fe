// Shared by every public page (landing, store registration).

// Same env var the owner upsell modal uses (shared/access/upsellContent.ts);
// falls back to the number in the Stitch design so the CTAs never render dead.
// Replace with the official sales number before publishing.
const SALES_WA = (import.meta.env.VITE_SALES_WA as string | undefined) || "6281263352767"

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
