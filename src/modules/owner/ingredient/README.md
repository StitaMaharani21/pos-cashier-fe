# modules/owner/ingredient

Master data for raw materials ("Bahan Baku") consumed by `by_ingredient` menus — e.g. coffee beans, milk. Backed by `pos-kasir-be`'s `internal/master/ingredient`: plain JSON CRUD at `/master/ingredients` (`GET/POST/PUT/DELETE`, `:id` variants, paginated with `page`/`per_page`/`search`).

Fields: `name`, `unit` (free text — no unit/UOM enum on the backend), `stock`, `min_stock`, `purchase_price`.

Hand-wired like `modules/owner/menu` (not the generic `CrudSection`) because the list needs pagination + debounced search, which `CrudSection` doesn't model — but uses a centered `CrudDialogFrame` (like `menu-category`) instead of a `Sheet`, since there's no image upload and the form is short.

## Stock adjustment

`PATCH /master/ingredients/{id}/stock` (`dto.AdjustIngredientStockRequest{delta, keterangan}`, both required) is the real stock-adjustment endpoint — `api/ingredient.service.ts`'s `adjustIngredientStock(id, payload)` calls it directly. `delta` can be either sign (positive for goods received, negative for a stock-opname correction); the backend atomically updates `mtr_ingredient.stok` and logs a `trx_stock_movement` row (type `ADJUSTMENT`, `reference_type` `MANUAL`) in the same call — there's no separate audit-log step on the frontend side. The "Sesuaikan Stok" row action/dialog (`components/AdjustIngredientStockDialog.tsx`) is the only UI for this; the full edit form (`IngredientForm.tsx`) still lets you overwrite `stock` directly via `PUT /master/ingredients/:id`, which does **not** get logged — prefer "Sesuaikan Stok" whenever the change needs a reason on record.

Stock is allowed to go negative by design (the payment deduction logic never blocks on insufficient stock) — don't clamp displayed/validated stock at 0.

For this ingredient's movement history or a store-wide drift check, see `modules/owner/stock-history` and `modules/owner/stock-reconciliation` — both call the audit-trail/reconciliation endpoints this module doesn't surface itself.

Sublayers: `api/` (service + pagination + stock-adjustment call), `components/` (form + adjust-stock dialog), `schemas/` (zod), `columns/` (`CrudColumn<Ingredient>[]`), `section/` (`IngredientSection.tsx`).
