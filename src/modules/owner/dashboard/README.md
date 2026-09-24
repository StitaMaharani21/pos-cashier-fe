# modules/owner/dashboard

Owner landing screen after login, matching the Figma dashboard design (Neela / Asta Studio file). Backed by `pos-kasir-be`'s real analytics endpoints — no mock data. Each widget is its own component wired to one endpoint via `dashboard.queries.ts`.

Still a deliberate exception to the `CrudSection`/`createCrudService` pattern used by the rest of `modules/owner/*`: there's no form/table to manage, just read-only widgets (plus one small write action), so each widget owns a small `useQuery` hook instead.

- `dashboard.queries.ts` — one `useQuery` per GET endpoint (`useDailyTransactionLimit`, `useDashboardSummary`, `useCashSummary`, `useRefundSummaryToday`, `usePopularMenu`, `usePaymentMethodValueBreakdown`, `useSalesTrend`, `useLowStockMenus`, `useOrderComposition`) plus `useRecordCashCount` (a `useMutation` for `POST /shifts/:id/cash-counts`, invalidating the cash-summary query on success).
- `schemas/cash-count.schema.ts` — zod schema for the "hitungan kas fisik" dialog form.
- `components/` — one presentational component per widget: `TransactionLimitCard`, `KpiCard` + `KpiCardsGrid` (the 6 top stat cards, including the clickable "Aktual Cash Laci" card), `CashCountDialog`, `PopularMenuTable`, `PaymentMethodDonutCard` (Recharts donut), `SalesTrendCard` (Recharts bar+line combo with a 7/30-hari toggle), `LowStockCard` (requires the Pro plan on the backend — renders a plain message if the endpoint 403s), `OrderCompositionCard`.
- `section/DashboardSection.tsx` — composes everything in the Figma layout (Limit → KPI grid → Menu Terpopuler + Metode Pembayaran → Penjualan chart → Stok Hampir Habis + Komposisi Order).

Endpoint DTOs live in `entities/order/model/order-analytics.types.ts`, `entities/shift/model/shift.types.ts`, `entities/refund/model/refund.types.ts`, and `entities/menu/model/menu.types.ts` (`LowStockMenu`) — all re-exported from the generated `owner-schema.d.ts` (see `scripts/generate-owner-types.mjs`'s `ALLOWED_PATH_PREFIXES`).
