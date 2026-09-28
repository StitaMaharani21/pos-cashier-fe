# modules/owner/cashier

Owner-managed cashier accounts. Backed by `pos-kasir-be`'s `internal/auth` cashier-management routes (owner-only): `POST /auth/users/cashier` (create), `GET /auth/users/cashier` (list, paginated), `GET /auth/users/cashier/limit` (plan/addon quota), `PATCH /auth/users/cashier/{id}/status` (activate/deactivate), `PUT /auth/users/cashier/{id}/photo` (multipart field `photo`, jpeg/png/webp ≤ 2MB, stored on R2) and `DELETE /auth/users/cashier/{id}/photo` (remove).

There's no full "edit" (no `PUT`), so `shared/api/crud/createCrudService`/`CrudSection` don't apply — hand-written functions in `api/cashier.service.ts` (same reasoning as `business-settings/api/business-settings.service.ts` for its singleton GET+PUT), wired directly with react-query in `section/CashierSection.tsx`, reusing `CrudTable`/`CrudDialogFrame` on their own instead of `CrudSection`.

Fields: `name`, `username`, `pin` (6-digit numeric, cashier login credential — not email/password like an owner), `phone_no`, `status` (`active`|`inactive`).

Profile photo (`photo`, URL, `""` = none): shown as a round avatar (initials fallback, `shared/ui/user-avatar`) in the Kasir column (with `@username` under the name). The create endpoint is JSON-only, so a photo picked in the create form (`shared/ui/avatar-picker`) is uploaded right after the account is created — if only that upload fails the account stays and a warning toast says so. The row's camera action ("Foto") opens `components/CashierPhotoDialog.tsx` to view it large, change or remove it (sent on "Simpan"). The same `photo` is also returned in the login response, for the cashier app's header.

Cashier quota is counted from **active** cashiers only — deactivating one frees a slot immediately (see `pos-kasir-be`'s `CountActiveUsersByRoleID`). The "Tambah Kasir" button disables once the quota card shows `used >= limit`.

`UserResponse`/`CashierLimitStatusResponse` aren't in the generated OpenAPI types (the backend's swag annotations type their success responses as `map[string]interface{}`) — hand-transcribed in `entities/cashier/model/cashier.types.ts`, same situation as `entities/auth/model/auth.types.ts`'s `LoginResponse`.

List page: the shared table pattern (`shared/ui/README.md` "Tabel") — client-side search (name / username / phone) and "Status" filter via `useClientTable`, 10 per page. Status is an inline switch (`PATCH …/status`); the "Aksi" column has the photo action.

Sublayers: `api/` (hand-written service functions), `components/` (create form + quota card + photo dialog), `schemas/` (zod), `columns/` (`CrudColumn<Cashier>[]`, built via a function so the status switch and photo action can reach the section's callbacks), `section/` (`CashierSection.tsx`).
