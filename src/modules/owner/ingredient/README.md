# modules/owner/ingredient

Master data for raw materials ("Bahan Baku") consumed by `by_ingredient` menus — e.g. coffee beans, milk. Backed by `pos-kasir-be`'s `internal/master/ingredient`: plain JSON CRUD at `/master/ingredients` (`GET/POST/PUT`, `PATCH :id/status`, paginated with `page`/`per_page`/`search`).

Fields: `name`, `unit` (picked from a fixed dropdown, `constants/units.ts` — never typed, so "kg" is always spelled the same; locked after creation because stock and recipes are counted in it; the backend itself still stores a plain string, so an older free-text unit keeps showing), `stock` (read-only here), `min_stock`, `purchase_price` (harga beli terakhir), `average_cost` (harga pokok rata-rata, owner only — the HPP basis).

Hand-wired like `modules/owner/menu` (not the generic `CrudSection`) because the list needs pagination + debounced search, which `CrudSection` doesn't model — but uses a centered `CrudDialogFrame` (like `menu-category`) instead of a `Sheet`, since there's no image upload and the form is short.

## Stock and harga beli are not edited here

Stock changes in one place only: **Riwayat Stok → Ubah Stok** (`modules/owner/stock-history`, *Stok Masuk* for goods received, *Koreksi* for a correction with a reason). This module only shows the stock and its row action *Kelola stok* opens Riwayat Stok. The form has no "Stok Awal": a new ingredient starts at 0.

The **harga beli** is set once at creation ("Harga Beli Awal", which is also the starting average cost) and afterwards changes only through *Stok Masuk* — so the average cost (HPP) and the price history follow real purchases. On edit it is shown read-only (with the average cost); the backend ignores `purchase_price` on `PUT`. The *Riwayat harga beli* row action opens `modules/owner/price-history`.

Stock is allowed to go negative by design (the payment deduction logic never blocks on insufficient stock) — don't clamp displayed/validated stock at 0.

For this ingredient's movement history or a store-wide drift check, see `modules/owner/stock-history` and `modules/owner/stock-reconciliation` — both call the audit-trail/reconciliation endpoints this module doesn't surface itself.

List page: the shared table pattern (`shared/ui/README.md` "Tabel") with server-side search and paging (10 per page). "Aksi": Kelola stok (→ Riwayat Stok), Riwayat harga beli, Edit; the Status column is an Aktif / Nonaktif toggle. Ingredients are never deleted; an inactive one is no longer offered for recipes or new stock, while menus whose recipe already uses it stay active. A stock at or below its minimum shows a "Menipis" badge.

Sublayers: `api/` (service + pagination), `components/` (form), `constants/` (`units.ts`), `schemas/` (zod), `columns/` (`CrudColumn<Ingredient>[]`), `section/` (`IngredientSection.tsx`).
