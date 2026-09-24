# modules/owner/menu

Manage sellable menu items. Backed by `pos-kasir-be`'s `internal/master/menu`:

- `GET /master/menus`, `GET /master/menus/:id` — list/detail (owner+cashier read, this app calls as owner)
- `POST /master/menus`, `PUT /master/menus/:id` — **`multipart/form-data`**, not JSON (image upload via R2) — `createCrudService`'s generic JSON create/update won't fit as-is; override in this feature's own service call, don't force the generic factory here
- `DELETE /master/menus/:id`
- `PATCH /master/menus/:id/availability` — quick-toggle action, not wired up by this screen (the Figma design's table has no inline toggle; `is_available` is only edited through the full add/edit form today).
- `PUT /master/menus/:id/stock` — **is** wired up: `api/menu.service.ts`'s `upsertMenuStock` calls it from both `createMenu`/`updateMenu` whenever `stock_deduction_method` is `by_menu` (`MenuForm.tsx`'s `stockQty` field). This call is an absolute set and is **not** logged to any audit trail (by backend design) — for a by_menu menu's movement history or drift check, see `modules/owner/stock-history`/`modules/owner/stock-reconciliation`, which cover both ingredients and menus.

Response includes server-computed `discount`/`final_price` (don't recompute client-side).

UI is a right-side slide-over sheet (`shared/ui/sheet.tsx`) rather than a centered dialog, matching the Figma design — so this feature is hand-wired (`api/menu.service.ts` + local `useQuery`/`useMutation` in `section/MenuSection.tsx`) instead of going through `shared/ui/crud/CrudSection`, which only supports centered modals. `MenuSection` also owns pagination (`page`/`per_page`), a debounced search box, and category-filter pills sourced from `/master/menu-categories`, all of which `CrudSection` has no support for either.

Sublayers:
- `api/` — hand-written multipart service (`listMenus`, `createMenu`, `updateMenu`, `deleteMenu`)
- `components/` — `MenuForm.tsx` (image upload, category select, availability/featured switches)
- `schemas/` — zod schema mirroring the multipart form fields
- `columns/` — `CrudColumn<Menu>[]` for the table view
- `section/` — `MenuSection.tsx`, the bespoke orchestrator (search, category pills, pagination, sheet)

**Not in scope yet**: `/master/addon-groups` (menu-addon groups/options) is owner-only and menu-adjacent, but isn't its own screen in the backend's design doc. Documented extension point inside this feature (e.g. an "addons" tab on the menu edit form) if/when that screen is actually needed — don't scaffold it speculatively.
