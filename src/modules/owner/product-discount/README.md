# modules/owner/product-discount

Per-menu, automatic discounts — applied to the cart without a code once qty reaches `minimum_qty`. Backed by `pos-kasir-be`'s `internal/master/discount` (product discount side): plain JSON CRUD at `/master/discounts/product-discounts` (`GET/POST/PUT/DELETE`, `:id` variants) — fits `shared/api/crud/createCrudService` directly, no overrides needed.

Fields: `name`, `type` (`percent`|`fixed`), `value`, `minimum_qty`, `start_date`, `end_date`, `status`, `menu_ids` (required, min 1 — `PUT` replaces the set wholesale).

The menu picker is a self-contained `listAllMenus()` fetch against `/master/menus` inside `ProductDiscountForm.tsx` (mirrors `recipe`'s `listAllIngredients()` idiom) rather than importing the `menu` module's own service.

Sublayers: `components/` (form fields + menu checkbox list), `schemas/` (zod), `columns/` (`CrudColumn<ProductDiscount>[]`), `section/` (`ProductDiscountSection.tsx`).
