# modules/owner/table

Manage dine-in tables used for QR-based guest ordering (Pro plan, `qr_self_order`). Backed by `pos-kasir-be`'s `internal/master/table`: plain JSON CRUD at `/master/tables` (owner+cashier) — fits `shared/api/crud/createCrudService` directly, wired through `shared/ui/crud/CrudSection`.

Fields: `number`, `status`.

**QR**: the "QR" row action (`components/TableQrDialog.tsx`) calls `POST /master/tables/:id/sessions` (`api/table.service.ts` → `openTableSession`), which opens — or reuses — the table's guest session and returns a `qr_token`. The dialog encodes `buildSelfOrderUrl(storeCode, qr_token)` (`shared/lib/self-order-url.ts`, `/pesan/:storeCode/:qrToken`) as a QR for the customer page in `modules/public/self-order`. The session lasts 4 hours, so the QR is shown/printed per service, not a permanent sticker. Set `VITE_PUBLIC_APP_URL` when the console runs on an address a customer's phone can't open.

Sublayers: `api/` (CRUD service + session call), `components/` (form, QR dialog), `schemas/` (zod), `columns/` (`CrudColumn<Table>[]`), `section/` (`TableSection.tsx`).
