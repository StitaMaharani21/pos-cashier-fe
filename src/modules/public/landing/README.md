# modules/public/landing

Public homepage, mounted at `/` — the first page any visitor sees, logged in or not. The owner console (`/app`) only opens after logging in. Static marketing content — `presentation/` only, no need for the full sublayer split unless it starts fetching dynamic data.

Built from the Stitch export (Tailwind CDN + Material Symbols) and converted to this app's stack:

- `landing.css` — the Stitch palette and type scale as Tailwind v4 `@theme` tokens, **all prefixed `neela-`** (`bg-neela-surface-container-low`, `text-neela-label-md`, `font-neela`). The Stitch palette reuses names the owner console's shadcn theme defines with other values (`primary`, `secondary`, `background`), so unprefixed tokens would collide or leak into the owner UI. Imported once from `src/index.css`; Plus Jakarta Sans is loaded in `index.html`. Stitch's custom spacing scale (`space-md`, `margin-desktop`, ...) was mapped onto Tailwind's default numeric spacing instead of re-declared.
- Icons: Material Symbols → `lucide-react` (already the app's icon set — no extra icon font). Filled checks/stars use `fill-*` on the lucide outline.
- `landing.content.ts` — every piece of copy (nav, pain points, pillars, plans + monthly/annual prices, testimonials, footer). Edit copy here, not in the components.
- `components/` — one component per page section, `LandingPage.tsx` composes them.
- Hero visual (`components/HeroShowcase.tsx`) — implemented from the Claude Design canvas "Neela POS — Iklan Kasir" (https://claude.ai/artifact/UEUWcX8UWuvXF5vGu45gWQ, one 1200×900 artboard): real screenshots of the cashier app (`src/assets/landing/*.webp` — Buat Pesanan, Mulai Shift, payment Tunai/QRIS) composed as an ad. Coordinates are the artboard's px values scaled with a container-query unit (`--u` = 1 design px), so it shrinks proportionally; callout text has a readable floor and the two secondary pills hide below a 28rem-wide container. Redesign on the canvas, then carry the new coordinates over here.

Copy follows the "Konten Landing Page — Neela POS" brief, in its **early-access mode (Opsi A)**: no customer logos or testimonials — `TrustBar` shows the early-access line and `EarlyAccessSection` (`#pilot`, nav "Cerita Pilot") stands in for testimonials. Filling `SOCIAL_PROOF` / `TESTIMONIALS` in `landing.content.ts` with real, owner-approved content switches both to Opsi B automatically (and the nav back to "Testimoni"). Also left out until confirmed: office address, legal entity name (footer shows the brand only), the QRIS/regulatory badge, and the 30-day refund guarantee (replaced by "Batalkan kapan saja").

CTAs are **session-aware** (`modules/public/shared/useIsOwnerSession`) — a logged-in owner never sees a sign-up prompt:

| | Visitor | Logged-in owner |
|---|---|---|
| Primary CTA (header, hero, pilot section, final banner — `components/PrimaryCta.tsx`) | "Daftar Early Access" → `/daftar` (`modules/public/store-registration`) | "Buka Dashboard" → `/app` |
| Header ghost link | "Masuk Portal" → `/login` | hidden (the primary CTA already goes to `/app`) |
| Starter / Pro plan buttons | → `/daftar` | "Tanya Paket Starter" / "Upgrade ke Pro Dine-In" → WhatsApp sales |
| Enterprise plan button | WhatsApp sales | WhatsApp sales |
| Final banner lead | sign-up pitch | owner copy (`FINAL_CTA_LEAD`) |

Sales/support buttons open WhatsApp via `waLink()` (`modules/public/shared/contact.ts` — `VITE_SALES_WA`, falling back to the number from the Stitch design; set the official one). Privacy/terms are plain text until those pages exist. The Stitch logo image was a temporary hosted URL, so the header/footer use a text wordmark (`modules/public/shared/NeelaWordmark`) until a real logo asset is added to `public/`.

`STARTER_SOFT_DAILY_LIMIT` (`modules/public/shared/pricing.ts`, ±50 per the brief) must match `pos-kasir-be`'s `plan.StarterDailyTransactionLimit` — currently **80** there, and the backend has no "3 days in a row → upgrade notice" logic yet (the limit only feeds the owner dashboard widget; it never blocks checkout).

Written to avoid CSR-only assumptions (no top-level `window`/`localStorage`/`document` reads during render — `scroll-smooth` on `<html>` is toggled in an effect) so this route can gain SSR/prerendering later without a rewrite — see the "Rendering/SEO decision" section in `ARCHITECTURE.md`.
