// Shared by every public page (landing, store registration).

// Same env var the owner upsell modal uses (shared/access/upsellContent.ts);
// falls back to the number in the Stitch design so the CTAs never render dead.
// Replace with the official sales number before publishing.
const SALES_WA = (import.meta.env.VITE_SALES_WA as string | undefined) || "6281263352767"

export function waLink(message: string): string {
  return `https://wa.me/${SALES_WA}?text=${encodeURIComponent(message)}`
}

export const SUPPORT_HOURS = "07.00–24.00 WIB"

// Brand name only — the legal entity (CV vs PT) and the official address
// aren't settled yet; add them here once they are.
export const COPYRIGHT_HOLDER = "NeelaPOS"

// Public self-service store registration page (modules/public/store-registration).
export const REGISTER_PATH = "/daftar"
