# Billing ("Paket & Addon")

`/app/billing` — the store's current plan (with its end date and active add-ons), the
3-tier plan comparison, and the add-ons. Not feature-gated (`routeAccess.ts`'s
`"billing"` entry is `{}`) since every owner, regardless of current plan, needs to be
able to see what unlocks what.

**Owners pay here with QRIS** (Midtrans Core API, `PaymentQrDialog`). Everything the
backend sells is bought from this page; everything else keeps the WhatsApp-to-sales
path (`contactLink()`/`waLink()`, same as the sidebar lock icons, `UpsellModal` and
`LockedPage`).

| Item | How |
| --- | --- |
| Upgrade Starter → Pro, renew Starter/Pro | `POST /subscriptions/payments {plan_id}` — the "Upgrade & Bayar" / "Perpanjang" buttons in `PlanComparisonGrid` |
| Laporan Lengkap, Inventori Lengkap | `POST /subscriptions/addon-payments {addon_code}` — "Beli" / "Perpanjang" in `AddonCard`, 30 days each |
| Device Tambahan | same endpoint with `qty` (1–10) — `DeviceAddonCard`; raises the device quota (Starter 2, Pro 4) |
| Enterprise, Kasir Tambahan, overage, an add-on with no price yet | WhatsApp |

**The backend is the source of truth for prices and rules.** `api/subscription.service.ts`
reads `GET /subscriptions/plans`, `/current` and `/addons` (catalogue rows plus `purchasable`,
`included_in_plan`, `owned_qty`, `active_until`, `permanent` for this store). The static price
list (`public/shared/pricing.ts`) is only the fallback when those requests fail, in which case
every card shows its old WhatsApp button — the page never depends on them. An add-on is sold
only once its row in the central `addon_catalog` table is active with a price; until then
(Laporan/Inventori ship unpriced) the card says "Harga: hubungi tim Neela".

**Upgrade warning.** The backend does not prorate: paying for a higher plan mid-term restarts the
30 days from today and the days left on the old plan are lost. The confirm step of the dialog
says so (with the old plan's end date) before the owner pays; renewing the same plan adds 30 days
on top of the current end date. Downgrades and Enterprise are refused by the backend
(`PLAN_DOWNGRADE_NOT_ALLOWED`, `PLAN_NOT_PURCHASABLE`), and the buttons aren't shown for them.

**After paying.** The dialog polls `GET /subscriptions/payments/:id` every 3 s until `PAID`, then
refetches capabilities, the billing queries and `["devices"]`. The backend caches a store's
plan/entitlements for 60 s, so what a payment unlocks may lag a little; the dialog says so and
capabilities are read once more after 65 s. The QR is 15 minutes; an expired one offers "Buat QR
baru" (the backend reuses a still-valid QR for the same item instead of charging twice).

Cross-module import note: `PlanComparisonGrid`/`CurrentPlanSummaryCard` read `PLANS`
from `src/modules/public/landing/presentation/landing.content.ts` directly — this is a
deliberate exception (reusing static plan-fact data, not components/styling) rather
than forking a second copy of plan names/features/prices that could drift from the
public pricing page.
