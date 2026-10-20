# modules/owner/financial-report

Owner "Laporan Keuangan" (Pro, or the Reports add-on). Read-only: one `useQuery` wrapper per `GET /reports/sales/*` endpoint in `financial-report.queries.ts`, no generic CRUD service. Types are hand-written in `financial-report.types.ts` (the generated schema has no `/reports/sales` paths).

## Tabs

Four groups; `?tab=<leaf id>` picks the leaf (unknown or removed ids fall back to Ringkasan).

| Group | Leaves |
|---|---|
| Ringkasan | `summary` |
| Kinerja | `cashier` (Kasir), `category`, `top-products`, `peak-hours` |
| Transaksi | `transactions` |
| Lainnya | `order-source` (Pro) |

There is no "Dibatalkan" tab: cancelled orders are the *Dibatalkan* option of the Status filter on Transaksi. Payments, discounts and tax are part of Ringkasan.

**Export** maps each tab to a backend report id (`REPORT_ID` in `FinancialReportSection.tsx` — they are not the same strings): Ringkasan → `daily` (the daily breakdown with a totals row), Kasir → `by-cashier`, Kategori → `by-category`, Transaksi → `transactions` (with the active kasir / no. order / status filters).

## Ringkasan

`section/SummaryTab.tsx`, each block loads and fails on its own:

- **Banner** "X transaksi dibatalkan pada periode ini — lihat detail" (from `summary.cancelled_count`, shown even when nothing was completed). "lihat detail" opens `?tab=transactions&status=dibatalkan` in a single URL update. The count is by the order's own date, so it equals the rows of that filtered list.
- **Six cards**: Total Transaksi, Pendapatan Kotor (before discount), Total Diskon, Total Pajak, Pendapatan Bersih, Rata-rata Transaksi. `Net = Gross − Discount + Tax` (not net of refunds).
- **Metode Pembayaran** (`components/PaymentChannelsCard.tsx`): Tunai, QRIS, Kartu Debit/Kredit, E-Wallet (+ Transfer Bank when used), merged by payment-method *type* (`lib/payment-channels.ts`). Same scope as the cards, so the channels add up to the net revenue.
- **Rincian Harian** (`components/DailyBreakdownTable.tsx`, `GET /reports/sales/daily`): one row per date with completed orders, newest first, with a totals line equal to the cards.

## Kinerja → Kasir

`section/CashierRankingTab.tsx`: a combo chart (bars = Total Penjualan, line = Jumlah Transaksi, tooltip shows both) and the table: Kasir · Transaksi Selesai · Total Penjualan Bersih · Rata-rata per Transaksi · Transaksi Dibatalkan.

## Transaksi → Detail Transaksi

`section/TransactionsTab.tsx` shows `GET /reports/sales/transactions` with `columns/report-transaction.columns.tsx`. Filters: Kasir, **Status Order** (Semua Status, Selesai, Dibatalkan, Direfund — "Direfund" is any order with a refund, partial or full; a partly refunded order is also listed under Selesai), and a No. Order search. The status is kept in `?status=`.

- **Status** (`lib/order-status.ts`) — order status and refund status are separate. The badge reads `cancelled > full refund > partial refund > order status`: *Dibatalkan*, *Direfund Penuh*, *Sebagian Direfund* (orange), otherwise *Selesai* / *Diproses* / *Menunggu*. The backend keeps an order `selesai` while only some items were refunded; it becomes `direfund` once every item is returned.
- **Total** — `net_total` (`grand_total − refund_amount`), what actually stayed with the store. A refunded row also shows the original total struck through and `(Ref: -Rp …)` underneath.
- **Metode Bayar** (`lib/payment-label.ts`) — category plus provider/bank: `Tunai`, `E-Wallet (GoPay)`, `Debit (BCA)` / `Kredit (Mandiri)`, `Transfer (BCA)`, `QRIS (Dinamis)` (Midtrans) or `QRIS (Statis)`. The bank/e-wallet is the payment's channel; the backend stores none for cash or QRIS.
- **Aksi** — the eye button (or clicking the row) opens `components/TransactionDetailSheet.tsx`.

## Detail drawer

Fetches lazily when a row is opened: `GET /orders/{id}/detail` (items with modifiers and notes, summary, payment incl. reference/approval code) and `GET /orders/{id}/refunds` (refund history). Each item shows **Normal** or **Direfund n dari m** with the refunded value, reason and time. The summary ends in **Total Bersih Dibayarkan** = grand total − refunds. There is no service-charge field in the backend, so none is shown.

A refund returns the items' value **plus their share of the tax** (the last refund of an order returns the exact remainder, so all refunds of a fully refunded order add up to the grand total). Refunds made before that change were items-only; the drawer shows the tax part of a refund as `total_amount − Σ item amounts`.
