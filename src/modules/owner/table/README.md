# modules/owner/table

Manage dine-in tables used for QR-based guest ordering (Pro plan, `qr_self_order`). Backed by `pos-kasir-be`'s `internal/master/table`: plain JSON CRUD at `/master/tables` (owner+cashier) — fits `shared/api/crud/createCrudService` directly, wired through `shared/ui/crud/CrudSection`.

Fields: `number`, `status`.

**QR (permanent)**: the "QR" row action (`components/TableQrDialog.tsx`) shows the table's **permanent QR code** — `GET /master/tables/:id/qr` (created on first request; `api/table.service.ts` → `getTableQR`). The QR encodes `buildSelfOrderUrl(storeCode, qr_code)` (`shared/lib/self-order-url.ts`, `/pesan/:storeCode/:qrToken` — the same route as before; the "token" is now the table's code). The owner prints it once and leaves it on the table; scanning it opens or reuses the table's order session automatically, so staff never have to "open" the table. **"Ganti QR"** (`rotateTableQR`, with a confirmation) issues a new code and closes the table's guest sessions: the printed QR stops working at once. "Cetak" prints one card (store name, big table number, QR, "Scan untuk melihat menu & memesan") and **"Cetak semua QR"** (toolbar, `CrudSection` `toolbarActions`) prints a card per active table, creating the missing codes on the way; both go through `lib/print-qr.ts` (static SVG in a throwaway window — the window is opened inside the click because browsers block popups opened after an `await`). Set `VITE_PUBLIC_APP_URL` when the console runs on an address a customer's phone can't open; the dialog warns about `localhost` links.

Who may order from a printed QR is limited by the backend, not here (cashier approval, a cap of pending orders per table, rate limits, and a location flag from the cafe's coordinates set in **Pengaturan Bisnis**) — see `modules/public/self-order/README.md`.

Sublayers: `api/` (CRUD service + QR calls), `lib/` (print), `components/` (form, QR dialog), `schemas/` (zod), `columns/` (`CrudColumn<Table>[]`), `section/` (`TableSection.tsx`).
