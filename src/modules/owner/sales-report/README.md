# modules/owner/sales-report

"Laporan Penjualan" — the owner-facing sales report at `/app/sales-report`, gated behind the `reports` feature (Pro+/addon), same as `routeAccess.ts`'s `sales-report` entry.

Like `modules/owner/dashboard`, this is a deliberate exception to the `CrudSection`/`createCrudService` pattern for its top section (read-only widgets, no form), but the transaction table follows `modules/owner/stock-history`'s pattern instead (local `useState` for filters/pagination + `CrudTable`).

**Important — three different data scopes on one page:**

- **Total Transaksi / Total Pendapatan / Rata-rata per Transaksi** call `useDashboardSummary(true)` — `sinceShiftOpen=true` scopes `GET /orders/dashboard-summary?since_shift_open=true` to the *currently active shift* (`trx_order.shift_id`), not the calendar day. This matters because the store may open later than midnight, or a shift can span past midnight — "since shift opened" is the meaningful "how's today going" scope for an owner glancing at this page, not calendar midnight. `shift_opened_at` in the response is `null` when no shift is currently open (the KPI cards render "Toko belum dibuka" in that case, distinct from "open with zero sales so far"), and the `*_change_percent` fields are always 0 in this mode (no "previous shift" to compare against, so no delta badge is rendered — see `dashboard.queries.ts`'s `useDashboardSummary` doc comment). The plain calendar-day mode (`sinceShiftOpen` omitted/false) is still what `modules/owner/dashboard`'s `KpiCardsGrid` uses — this page's shift-scoped mode is additive, not a replacement.
- **Produk Terlaris** and the sales trend chart (`SalesTrendCard`, reused from `dashboard`) read `pos-kasir-be`'s other fixed-window analytics endpoints (`GET /orders/popular-menu` = always a rolling 7 days, `GET /orders/sales-trend` = a 7/30-day toggle). **Neither accepts a custom date range**, and neither is shift-scoped.
- Only the "Rincian Transaksi" table below is filterable by date, backed by `GET /orders/financial-report`, which is the sole endpoint that accepts `start_date`/`end_date` (plus `cashier_id`, `payment_method_id`, `search`, `page`, `per_page`).

So the page's date-preset/custom-range filter bar (`SalesReportFilterBar`) **only affects the transaction table** — it does not refilter the KPI cards or chart above it. This was a deliberate product decision (not an oversight) given the backend's fixed-window widgets; see the caption rendered under the KPI row.

- `sales-report.queries.ts` — `useFinancialReport`, one `useQuery` wrapper for `GET /orders/financial-report`. `useDashboardSummary`/`usePopularMenu` are imported directly from `dashboard.queries.ts` (they're endpoint-scoped, not dashboard-coupled, so no local re-wrap needed).
- `lib/date-presets.ts` — `presetToRange`, computes `{start, end}` Date ranges for the "Hari Ini"/"7 Hari Terakhir"/"Bulan Ini" presets with `date-fns`. `end` is always exclusive, matching the backend's RFC3339 start-inclusive/end-exclusive contract.
- `components/SalesReportFilterBar.tsx` — date presets + two native `<input type="date">` for a custom range (no Popover/Calendar library added — deliberately lightweight), plus Kasir/Metode Pembayaran `Select`s (`listCashiers`, `listPaymentMethods`) and a debounced search input.
- `columns/financial-report.columns.tsx` — `CrudColumn<FinancialReportTransaction>[]` for the table. The "Aksi" column is an inert placeholder icon — no order-detail view exists in this app yet.
- `section/SalesReportSection.tsx` — composes everything and owns all filter/pagination state (mirrors `StockHistorySection`/`MenuSection`'s idiom).

**Response shape gotcha**: `GET /orders/financial-report` double-nests its envelope — `SingleResponse<FinancialReportListResponse>` where `FinancialReportListResponse` itself carries `{data, total, page, per_page, total_pages, page_summary}` — unlike the flat `PaginatedResponse<T>` most list endpoints in this codebase use. `page_summary` is the sum for the **current page only**, not the whole filtered result set, hence the table footer is labeled "Total Halaman Ini".

Types are generated from `pos-kasir-be`'s swagger (`/orders/financial-report` was added to `ALLOWED_PATH_PREFIXES` in `scripts/generate-owner-types.mjs`) and re-exported from `entities/order/model/order-analytics.types.ts` alongside the other order-analytics DTOs.
