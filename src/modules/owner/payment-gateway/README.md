# modules/owner/payment-gateway

Where the owner connects **the store's own Midtrans account** (Pro+). Customers then pay orders by QRIS and the money lands in that account — unlike `billing/`, which pays Neela for the plan. Route `/app/payment-gateway` ("Pengaturan → Pembayaran Online"), gated by the `online_payment` feature in `app/router/routeAccess.ts`: Starter owners see the lock/upsell in the sidebar and `LockedPage` by URL.

Backed by `pos-kasir-be`'s `internal/central/store_payment_gateway` — a **singleton**, so `createCrudService` doesn't apply: hand-written `getPaymentGateway` / `savePaymentGateway` / `removePaymentGateway` in `api/payment-gateway.service.ts`.

- `GET /payment-gateway` → `{provider, configured, key_last4?, is_active, environment, notification_url?}`. Never contains the key. `environment` is the **server's** mode (not a per-store choice), so the owner must enter a matching key; `notification_url` is empty when the server has no `APP_PUBLIC_URL` (online payment can't work — the card warns).
- `PUT /payment-gateway {server_key}` — the backend checks the key shape, pings Midtrans, stores it encrypted and switches on the managed "QRIS Midtrans" payment method. Errors: `INVALID_SERVER_KEY` (shown on the field), `PAYMENT_PROVIDER_UNAVAILABLE` (502), `PAYMENT_PROVIDER_NOT_CONFIGURED` (503) — the last two are toasts.
- `DELETE /payment-gateway` — removes the key and deactivates the managed method (old payments keep referencing it).
- A `402 FEATURE_NOT_IN_PLAN` (e.g. a plan downgrade mid-session) is handled by the api client interceptor (upsell modal + capabilities refetch); the service maps it to `CrudServiceError("FEATURE_NOT_IN_PLAN")` and the UI shows no toast for it.

Types are hand-written in `entities/payment-gateway` (the endpoint isn't in `ALLOWED_PATH_PREFIXES`). Saving or removing invalidates `["payment-gateway"]` **and** `["payment-methods"]`, since the managed method is created/disabled as a side effect.

Sublayers: `components/` (`ServerKeyForm`, `GatewayStatusCard`), `schemas/` (zod), `section/` (`PaymentGatewaySection.tsx`) — no `columns/`, there's no table here.
