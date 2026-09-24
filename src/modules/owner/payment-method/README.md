# modules/owner/payment-method

Manage which payment methods cashiers can accept. Backed by `pos-kasir-be`'s `internal/master/payment_method`: `/master/payment-methods` (owner-only). **`POST`/`PUT` are `multipart/form-data`, not JSON** (image upload for the QRIS type) — `shared/api/crud/createCrudService` doesn't fit, so `api/payment-method.service.ts` is hand-written instead, same pattern as `menu`.

Fields: `name` (required — never typed by the owner: fixed "Tunai"/"QRIS" for cash/qris, otherwise picked from the fixed lists in `constants/payment-providers.ts` — e-wallet providers, banks, or Debit/Kredit for card; no "other" free-text option. Providers already saved for the same type are disabled in the picker. The backend has no provider column, so the chosen provider *is* the `name`), `type` (required, backend-enforced `oneof=cash card transfer qris ewallet`), `status` (free string — no backend enum, this app uses `active`/`inactive`), `image` (optional per the backend; this app requires it in the form specifically when `type = qris`).

The Figma design's "Tambah Metode Pembayaran" panel only shows Nama Metode + Status — `type` (and the conditional QRIS image field) were added on top of the mock since the backend can't create a working payment method without them.

UI is also a deliberate deviation from the rest of `modules/owner/*`: the Figma mock keeps the add/edit form permanently visible beside the table (not a toggleable dialog), so `section/PaymentMethodSection.tsx` is hand-wired (list/create/update/delete `useQuery`/`useMutation` + `CrudTable`) rather than going through `shared/ui/crud/CrudSection`.

Sublayers: `api/` (multipart service), `constants/` (provider lists, `TYPE_META` icon/color per type), `components/` (`PaymentMethodForm.tsx`), `schemas/` (zod), `columns/` (`CrudColumn<PaymentMethod>[]`, type-colored icon per row), `section/` (`PaymentMethodSection.tsx`).
