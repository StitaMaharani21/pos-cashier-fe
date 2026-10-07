# modules/owner/business-settings

Store-wide info printed on receipts and used across the app. Backed by `pos-kasir-be`'s `internal/master/business_setting` — a **singleton**: `GET /master/business-settings`, `PUT /master/business-settings` only, no create/delete/list, so `shared/api/crud/createCrudService` doesn't apply here — two hand-written functions (`getBusinessSettings`, `updateBusinessSettings`).

- `GET` 404s until the row exists ("created automatically on first update") — `getBusinessSettings` returns `null` for that case only; any other failure surfaces as an error state, so an empty form can never overwrite real data.
- `PUT` is **`multipart/form-data`**, not JSON: `business_name`, `address`, `phone_no` (required), `email` (valid email or empty), `tax_percentage` (0–100), `receipt_footer`, and an optional `logo` file (jpeg/png/webp, ≤2MB, uploaded to R2 by the backend). Omitting `logo` keeps the current one. It replaces every other field on each call.

"Ganti Logo" uploads immediately (PUT with the *saved* settings + the new file), separate from the form's "Simpan Perubahan", and is disabled until the settings row exists — the PUT needs the required fields, so the form must be saved once first.

Sublayers: `components/` (`BusinessSettingsForm`, `BusinessLogoCard`), `schemas/` (zod), `section/` (`BusinessSettingsSection.tsx`) — no `columns/`, there's no table/list here.

**Lokasi kafe (Pesan dari Meja).** `latitude`, `longitude` and `self_order_radius_m` (default 100 m) live in the same PUT. They feed the "di luar radius" flag the backend puts on QR-table orders; it is only a hint for the cashier. The form's "Gunakan lokasi saya sekarang" fills the coordinates from the device (press it at the cafe). Coordinates are both-or-neither, and a PUT that omits them keeps the saved location — which is why the logo upload, which resends the other fields, never clears it.
