# modules/owner/cashier

Owner-managed cashier accounts. Backed by `pos-kasir-be`'s `internal/auth` cashier-management routes (owner-only): `POST /auth/users/cashier` (create), `GET /auth/users/cashier` (list, paginated), `GET /auth/users/cashier/limit` (plan/addon quota), `PATCH /auth/users/cashier/{id}/status` (activate/deactivate).

There's no full "edit" (no `PUT`), so `shared/api/crud/createCrudService`/`CrudSection` don't apply — hand-written functions in `api/cashier.service.ts` (same reasoning as `business-settings/api/business-settings.service.ts` for its singleton GET+PUT), wired directly with react-query in `section/CashierSection.tsx`, reusing `CrudTable`/`CrudDialogFrame` on their own instead of `CrudSection`.

Fields: `name`, `username`, `pin` (6-digit numeric, cashier login credential — not email/password like an owner), `phone_no`, `status` (`active`|`inactive`).

Cashier quota is counted from **active** cashiers only — deactivating one frees a slot immediately (see `pos-kasir-be`'s `CountActiveUsersByRoleID`). The "Tambah Kasir" button disables once the quota card shows `used >= limit`.

`UserResponse`/`CashierLimitStatusResponse` aren't in the generated OpenAPI types (the backend's swag annotations type their success responses as `map[string]interface{}`) — hand-transcribed in `entities/cashier/model/cashier.types.ts`, same situation as `entities/auth/model/auth.types.ts`'s `LoginResponse`.

Sublayers: `api/` (hand-written service functions), `components/` (create form + quota card), `schemas/` (zod), `columns/` (`CrudColumn<Cashier>[]`, built via a function so the status-toggle button can reach the section's mutation), `section/` (`CashierSection.tsx`).
