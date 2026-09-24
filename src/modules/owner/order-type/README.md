# modules/owner/order-type

Manage which order types (dine-in/takeaway/delivery) cashiers can select, and their display order. Backed by `pos-kasir-be`'s `internal/master/order_type`: `GET /master/order-types` (no params, no pagination), `PUT /master/order-types/:id` (`{enabled, sort_order}` only).

**No create/delete** — the 3 order types are a fixed, backend-seeded set (`dine_in`/`takeaway`/`delivery`); `type` itself is immutable. `createCrudService`/`CrudSection` don't apply here since there's no create/delete and the list takes no params — `api/order-type.service.ts` is hand-written (list + update only).

`section/OrderTypeSection.tsx` renders all 3 rows inline (icon + label, an "Urutan" number input committed on blur, an "Aktif" switch committed immediately) — no table, no dialog, matching how trivial the edit surface is.
