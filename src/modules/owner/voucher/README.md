# modules/owner/voucher

Order-level, code-redeemed discounts. Backed by `pos-kasir-be`'s `internal/master/discount` (voucher side): plain JSON CRUD at `/master/discounts/vouchers` (`GET/POST/PUT/DELETE`, `:id` variants) — fits `shared/api/crud/createCrudService` directly, no overrides needed.

Fields: `name`, `code`, `type` (`percent`|`fixed`), `value`, `minimum_purchase`, `start_date`, `end_date`, `status`.

A voucher already redeemed in an order can't be deleted (backend returns `409 VOUCHER_IN_USE`) — the form shows an inline hint near Status suggesting "inactive" instead, rather than special-casing the error in `CrudSection`.

Applying a voucher to a cart (`POST/DELETE /carts/{id}/voucher`) is a separate cashier-facing flow and lives outside this module.

Sublayers: `components/` (form fields), `schemas/` (zod), `columns/` (`CrudColumn<Voucher>[]`), `section/` (`VoucherSection.tsx`).
