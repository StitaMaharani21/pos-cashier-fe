# modules/owner/table

Manage dine-in tables used for QR-based guest ordering. Backed by `pos-kasir-be`'s `internal/master/table`: plain JSON CRUD at `/master/tables` (owner+cashier) — fits `shared/api/crud/createCrudService` directly.

Fields: `number`, `status`.

**Out of scope for this screen**: `POST /master/tables/:id/sessions` (opening a QR guest session) — that belongs to the guest ordering flow, not owner table master-data management (per `owner-dashboard-and-master-crud.md`'s explicit call-out).

Sublayers: `components/` (form fields, status toggle), `schemas/` (zod), `columns/` (`CrudColumn<Table>[]`), `section/` (`TableSection.tsx`).
