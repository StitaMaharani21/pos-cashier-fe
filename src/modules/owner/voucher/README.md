# modules/owner/voucher

Order-level, code-redeemed discounts. Backed by `pos-kasir-be`'s `internal/master/discount` (voucher side): plain JSON CRUD at `/master/discounts/vouchers` (`GET/POST/PUT/DELETE`, `:id` variants) through `shared/api/crud/createCrudService`, shown by `CrudSection` with `presentation="sheet"` (right-hand drawer).

Fields: `name`, `code`, `type` (`percent`|`fixed`), `value`, `max_discount` (percent only, per order, 0 = no cap), `minimum_purchase` (checked against the total after automatic menu discounts), `start_date`, `end_date` (**omitted = never expires**), `status`.

The drawer (`components/VoucherForm.tsx`) uses the same cards as diskon otomatis (`modules/owner/discount-form`): Informasi Voucher (name ≤50, code — upper-cased, no spaces, "Acak" generates one — and Aktif), Nilai Diskon (Persen/Nominal, Maksimal Potongan, Minimal Belanja), Periode Berlaku (presets, no day/hour schedule), a summary, then Batal / Simpan Voucher (Hapus on edit).

**Expiry & reactivation** (enforced by the backend, mirrored in the form):
1. A voucher is valid between `start_date` and `end_date`; the backend checks this whenever a code is applied.
2. Once the end date has passed, the backend switches the voucher to `inactive` by itself: a scheduled job (`internal/scheduler`, every 15 minutes, all stores) plus a lazy check whenever vouchers are listed, read or applied. The end date is the **end of that day** (store time), so a voucher ending today still works until 23:59:59. The list shows expired rows as inactive with a "Kedaluwarsa" note, even if the page was left open past midnight and the list is stale (`isExpired` in `columns/voucher.columns.tsx`, also used by the Status filter).
3. An inactive voucher can be switched back on from the drawer (Aktif switch).
4. On reactivation the start date must be **today or later** — no past dates (`400 VOUCHER_START_DATE_PAST`, shown as a friendly message by `shared/api/error-message.ts`). The form checks this up front (`createVoucherSchema({ reactivating })`), moves a past start date to today when the switch is turned on, and greys out earlier days in the date picker. Saving a voucher that stays inactive, or editing an active one, is not checked.

A voucher already redeemed in an order can't be deleted (backend returns `409 VOUCHER_IN_USE`) — the Aktif row's hint suggests deactivating it instead, rather than special-casing the error in `CrudSection`.

Applying a voucher to a cart (`POST/DELETE /carts/{id}/voucher`) is a separate cashier-facing flow and lives outside this module.

List page: the shared table pattern (`shared/ui/README.md` "Tabel") via `CrudSection` — client-side search on name + code, "Status" filter, 10 per page, and an "Aksi" column (Edit opens the drawer, Hapus asks for confirmation). Rows themselves aren't clickable.

Sublayers: `components/` (drawer form), `schemas/` (zod, on top of `discount-form/schemas`), `columns/` (`CrudColumn<Voucher>[]`), `section/` (`VoucherSection.tsx`).
