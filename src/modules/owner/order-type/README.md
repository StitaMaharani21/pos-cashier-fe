# modules/owner/order-type

Manage which order types (dine-in/takeaway/delivery) cashiers can select, and their display order. Backed by `pos-kasir-be`'s `internal/master/order_type`: `GET /master/order-types` (no params, no pagination), `PUT /master/order-types/:id` (`{enabled, sort_order}` only).

**No create/delete** — the 3 order types are a fixed, backend-seeded set (`dine_in`/`takeaway`/`delivery`); `type` itself is immutable. `createCrudService`/`CrudSection` don't apply here since there's no create/delete and the list takes no params — `api/order-type.service.ts` is hand-written (list + update only).

`section/OrderTypeSection.tsx` renders all 3 rows inline (drag handle + icon + label, an "Aktif" switch committed immediately) — no table, no dialog, matching how trivial the edit surface is.

**Order is changed by dragging** (`shared/hooks/useRowReorder` + `shared/ui/drag-handle`, same as the menu categories; ArrowUp/ArrowDown on the handle also work). There is no bulk-reorder endpoint here, so a drag saves each row whose position changed with `PUT /master/order-types/:id` using its new index as `sort_order` (0, 1, 2), then reloads the list; if a save fails the list snaps back to what the server has.
