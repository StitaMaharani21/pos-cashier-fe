# modules/owner/refund-approval

"Persetujuan Refund" (`/app/refund-approval`, owner). Cashiers can no longer refund directly: from the cashier app they **submit a request** (a reason of at least 5 characters is required) for a paid order that is Diproses **or Selesai**, and the owner approves or rejects it here. Nothing (cash, stock, order status) changes until it is approved. A refund the owner makes directly (`POST /orders/:id/refunds`, owner only) is still processed at once.

Backed by `pos-kasir-be`'s `internal/transaction/refund` (request service/handler):

- `GET /refund-requests?page&per_page&status&search` — the table; `?tab=` on the page picks the status (default **Menunggu**).
- `GET /refund-requests/pending-count` — the badge on the sidebar item and the reminder on the dashboard (`PendingRefundNotice`), polled every 30 s.
- `POST /refund-requests/:id/approve` `{note?}` — runs the same refund a direct one would (cash out of the **running shift's** drawer, optional stock restore as the cashier asked, order → "Direfund" when everything is refunded). With no open shift it fails with `NO_ACTIVE_SHIFT` and the request stays pending — open a shift first.
- `POST /refund-requests/:id/reject` `{note}` — the note is required and shown to the cashier.
- `GET /orders/:id/refund-requests` — the transaction detail sheet (financial-report) lists the requests of an order (`OrderRefundRequests`).

A pending request reserves its qty: the same item can't be requested twice beyond what is left. A cashier can cancel their own pending request from the cashier app; the owner sees it as "Dibatalkan".

Types are hand-written in `entities/refund-request`. Access follows `routeAccess["refund-approval"]` (`pos` feature + `refund` module).
