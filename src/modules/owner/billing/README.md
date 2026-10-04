# Billing ("Paket & Addon")

`/app/billing` — a read-only discovery page showing the store's current plan, the
3-tier plan comparison, and the 3 add-ons (Reports/Inventory/Extra Cashier). Not
feature-gated (`routeAccess.ts`'s `"billing"` entry is `{}`) since every owner,
regardless of current plan, needs to be able to see what unlocks what.

**No payment integration.** pos-kasir-be has no self-serve checkout for plan/addon
changes (confirmed: `PATCH /internal/stores/:id/plan` and the `/internal/stores/:id/addons`
endpoints are admin-only, separate "Neela Control" auth, no payment gateway anywhere
in the backend). Every CTA on this page reuses the exact same `contactLink()`/`waLink()`
WhatsApp-to-sales mechanism the sidebar lock icons, `UpsellModal`, and `LockedPage`
already use — this page is a better front door to that existing flow, not a different
one. If/when real self-service checkout gets built, this is the page that would grow
an actual payment flow.

Cross-module import note: `PlanComparisonGrid`/`CurrentPlanSummaryCard` read `PLANS`
from `src/modules/public/landing/presentation/landing.content.ts` directly — this is a
deliberate exception (reusing static plan-fact data, not components/styling) rather
than forking a second copy of plan names/features/prices that could drift from the
public pricing page.
