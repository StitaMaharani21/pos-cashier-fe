# modules/owner/menu

Manage sellable menu items. **One sidebar entry "Menu" (`/app/menu`) for both master-data screens**: `section/MenuCatalogSection.tsx` renders the tabs "Kategori Menu" (`?tab` absent — `modules/owner/menu-category`) and "Menu" (`?tab=menu` — this module's `MenuSection`), each with its count badge. The old `/app/menu-category` URL redirects to `/app/menu`.

Backed by `pos-kasir-be`'s `internal/master/menu`:

- `GET /master/menus` — paged list with `search`, `category_id`, `available` (the "Status: Tersedia / Tidak tersedia" filter), ordered by `urutan` (= `sort_order`, the same order the cashier app uses)
- `POST /master/menus`, `PUT /master/menus/:id` — **`multipart/form-data`** (image upload via R2); PUT without an image keeps the current one. New menus are appended last by the backend.
- `PUT /master/menus/reorder` `{ids}` — drag-to-reorder. `ids` may be only the rows on screen (one page, or a filtered list): the backend rearranges them within the slots they already occupy, so dragging works with any filter on (`internal/common/ordering`).
- `PATCH /master/menus/:id/availability` — the "Tersedia" switch in each row
- "Unggulan" star — no dedicated endpoint: `setMenuFeatured` resends the row's own fields through the regular PUT with `is_featured` flipped
- `DELETE /master/menus/:id` — from the eye/preview sheet (`MenuPreviewSheet`); the row itself has edit + view only, per the design
- `PUT /master/menus/:id/stock` — `upsertMenuStock`, called from `createMenu`/`updateMenu` when `stock_deduction_method` is `by_menu` (`MenuForm.tsx`'s `stockQty` field). An absolute set, **not** audited — see `modules/owner/stock-history` / `stock-reconciliation`.

Response includes server-computed `discount`/`final_price` (don't recompute client-side).

Reordering is native HTML5 drag & drop via `shared/hooks/useRowReorder` (no extra dependency): a row is draggable only while its grip (`shared/ui/drag-handle`) is pressed; the grip also takes ArrowUp/ArrowDown. The new order shows optimistically until the refetch.

Sublayers:
- `api/` — hand-written multipart service (`listMenus`, `createMenu`, `updateMenu`, `deleteMenu`, `reorderMenus`, `setMenuAvailability`, `setMenuFeatured`)
- `components/` — `MenuForm.tsx` (add/edit sheet, in the design's cards: Foto — `shared/ui/image-dropzone` with drag & drop, required on create by the backend; Informasi Dasar — the code is **not typed**: empty on create so the backend generates `MNU-001`, `MNU-002`, …, locked on edit; description ≤150; Harga & Penyajian — price typed as digits, shown as `28.000`; Stok — "Tidak dilacak | Lacak stok", then per menu (`by_menu`, qty) or per bahan baku (`by_ingredient`, recipe, plan-gated); Pengaturan Tampilan — Tersedia / Unggulan), `MenuPreviewSheet.tsx` (eye action)
- `constants/` — `MENUS_KEY` query-key prefix, `stockLabel`
- `schemas/` — zod schema mirroring the multipart form fields
- `section/` — `MenuCatalogSection.tsx` (tabs), `MenuSection.tsx` (the Menu tab: toolbar, table, pagination, sheets)

**Not in scope yet**: `/master/addon-groups` (menu-addon groups/options) is owner-only and menu-adjacent, but isn't its own screen in the backend's design doc. Documented extension point inside this feature (e.g. an "addons" tab on the menu edit form) if/when that screen is actually needed — don't scaffold it speculatively.
