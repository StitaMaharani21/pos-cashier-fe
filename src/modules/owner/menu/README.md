# modules/owner/menu

Manage sellable menu items. **One sidebar entry "Menu" (`/app/menu`) for the product master-data screens**: `section/MenuCatalogSection.tsx` renders the tabs "Kategori Menu" (`?tab` absent — `modules/owner/menu-category`), "Menu" (`?tab=menu` — this module's `MenuSection`) and "Tambahan" (`?tab=tambahan` — `modules/owner/menu-addon`'s `MenuAddonSection`), each with its count badge. The old `/app/menu-category` and `/app/menu-addon` URLs redirect to `/app/menu` (the latter to the Tambahan tab).

Backed by `pos-kasir-be`'s `internal/master/menu`:

- `GET /master/menus` — paged list with `search`, `category_id`, `available` (the "Status: Tersedia / Tidak tersedia" filter), ordered by `urutan` (= `sort_order`, the same order the cashier app uses)
- `POST /master/menus`, `PUT /master/menus/:id` — **`multipart/form-data`** (image upload via R2); PUT without an image keeps the current one. New menus are appended last by the backend.
- `PUT /master/menus/reorder` `{ids}` — drag-to-reorder. `ids` may be only the rows on screen (one page, or a filtered list): the backend rearranges them within the slots they already occupy, so dragging works with any filter on (`internal/common/ordering`).
- `PATCH /master/menus/:id/availability` — the "Tersedia" switch in each row
- "Unggulan" star — no dedicated endpoint: `setMenuFeatured` resends the row's own fields through the regular PUT with `is_featured` flipped
- `PATCH /master/menus/:id/status` `{status}` — the "Status" switch in each row and the Nonaktifkan / Aktifkan button in the eye/preview sheet (both immediate, no confirmation) (`MenuPreviewSheet`). **Menus are never deleted** (`DELETE` answers 409 `MASTER_DATA_CANNOT_BE_DELETED`). An inactive menu — or one whose category is inactive — is hidden from the cashier app and self-order; the owner list still returns it with `effective_active=false` / `inactive_reason` (`self` | `category`). Not the same as "Tersedia" (`is_available`, sold out, still shown greyed out in the cashier app).
- **Stock is managed in one place: *Riwayat Stok*** (`modules/owner/stock-history`, `/app/stock-history?tab=menu`) — *Ubah Stok* (*Stok Masuk* `POST /master/menus/:id/stock-in`, *Koreksi* `PATCH /master/menus/:id/stock`). The form never edits stock and has no "Stok Awal": it shows the current stock read-only (a new menu starts at 0) and links there, so there is one place to add stock and no way to overwrite sales made since the form was opened. A menu's selling **price** only affects new orders (orders keep the price they were sold at); every change is kept in the price history (*Riwayat harga* in the list and next to the Harga field, `modules/owner/price-history`). Menus without a recipe can carry an optional **Harga Pokok per Porsi** (`cost_price`, owner only) used by the gross-profit report; menus with a recipe are costed from their ingredients.

The form keeps to what the owner acts on: field helper text, card subtitles and the stock-mode explanations live behind a small "i" next to the card title or label (`shared/ui/info-tip`, see `shared/ui/README.md`), opened on click.

A per-menu tracked menu (`by_menu`) has a **Stok Minimum** (`min_stock` on create/update, `low_stock_threshold` in the response; default 5) — the limit at or under which it counts as "Menipis" in Riwayat Stok, the dashboard's low-stock card and the cashier app. It lives on the menu (`mtr_menu.stok_minimum`), not on the stock row, because that row only exists once stock was first filled in; other stock methods clear it (by_ingredient uses each bahan baku's own stok minimum).

Response includes server-computed `discount`/`final_price` (don't recompute client-side).

Reordering is native HTML5 drag & drop via `shared/hooks/useRowReorder` (no extra dependency): a row is draggable only while its grip (`shared/ui/drag-handle`) is pressed; the grip also takes ArrowUp/ArrowDown. The new order shows optimistically until the refetch.

Sublayers:
- `api/` — hand-written multipart service (`listMenus`, `createMenu`, `updateMenu`, `setMenuStatus`, `reorderMenus`, `setMenuAvailability`, `setMenuFeatured`)
- `components/` — `MenuForm.tsx` (add/edit sheet, in the design's cards: Foto — `shared/ui/image-dropzone` with drag & drop, required on create by the backend; Informasi Dasar — the code is **not typed**: empty on create so the backend generates `MNU-001`, `MNU-002`, …, locked on edit; description ≤150; Harga & Penyajian — price typed as digits, shown as `28.000`; Stok — "Tidak dilacak | Lacak stok", then per menu (`by_menu`, qty) or per bahan baku (`by_ingredient`, recipe, plan-gated); Tambahan Menu — the add-on groups this menu offers (`modules/owner/menu-addon`'s `MenuAddonsField`, see below); Pengaturan Tampilan — Tersedia / Unggulan), `MenuPreviewSheet.tsx` (eye action)
- `constants/` — `MENUS_KEY` query-key prefix, `stockLabel`
- `schemas/` — zod schema mirroring the multipart form fields
- `section/` — `MenuCatalogSection.tsx` (tabs), `MenuSection.tsx` (the Menu tab: toolbar, table, pagination, sheets)

**Addons** (extra-charge options like "Gula +Rp5.000") are managed from this form: the "Tambahan Menu" card lists the menu's groups and lets the owner create a group, pick an existing one (groups are shared across menus), edit it in a stacked drawer, or detach it. Nothing is sent until "Simpan Menu": `MenuForm` passes `useMenuAddons().commit` to `onSubmit`, and `MenuSection` calls it with the menu id right after `createMenu`/`updateMenu`. If an addon step fails the menu is already saved: the sheet stays open on that menu (form remounted via `formSession`) with an error toast. See `modules/owner/menu-addon`.
