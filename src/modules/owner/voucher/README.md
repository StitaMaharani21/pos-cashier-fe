# modules/owner/voucher

Order-level, code-redeemed discounts. Backed by `pos-kasir-be`'s `internal/master/discount` (voucher side): plain JSON CRUD at `/master/discounts/vouchers` (`GET/POST/PUT/DELETE`, `:id` variants) through `shared/api/crud/createCrudService`, shown by `CrudSection` with `presentation="sheet"` (right-hand drawer).

Fields: `name`, `code`, `type` (`percent`|`fixed`), `value`, `max_discount` (percent only, per order, 0 = no cap), `minimum_purchase` (checked against the total after automatic menu discounts), `start_date`, `end_date` (**omitted = never expires**), `status`.

The drawer (`components/VoucherForm.tsx`) uses the same cards as diskon otomatis (`modules/owner/discount-form`): Informasi Voucher (name ≤50, code — upper-cased, no spaces, "Acak" generates one — and Aktif), Nilai Diskon (Persen/Nominal, Maksimal Potongan, Minimal Belanja), Periode Berlaku (presets, no day/hour schedule), a summary, then Batal / Simpan Voucher (Hapus on edit).

A voucher already redeemed in an order can't be deleted (backend returns `409 VOUCHER_IN_USE`) — the Aktif row's hint suggests deactivating it instead, rather than special-casing the error in `CrudSection`.

Applying a voucher to a cart (`POST/DELETE /carts/{id}/voucher`) is a separate cashier-facing flow and lives outside this module.

List page: the shared table pattern (`shared/ui/README.md` "Tabel") via `CrudSection` — client-side search on name + code, "Status" filter, 10 per page, and an "Aksi" column (Edit opens the drawer, Hapus asks for confirmation). Rows themselves aren't clickable.

Sublayers: `components/` (drawer form), `schemas/` (zod, on top of `discount-form/schemas`), `columns/` (`CrudColumn<Voucher>[]`), `section/` (`VoucherSection.tsx`).
