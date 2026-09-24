# modules/owner/stock-history

Read-only audit trail of stock movements — every automatic deduction on sale (`POST /orders/{id}/payments`) and every manual adjustment (`PATCH /master/ingredients/{id}/stock`), for both ingredients and by_menu menus. Backed by `pos-kasir-be`'s `GET /master/ingredients/{id}/stock-movements` and `GET /master/menus/{id}/stock-movements` (both owner-only, paginated).

There's no "list all movements across every item" endpoint — the owner picks a source type (Bahan Baku/Menu) and one item first, then sees that item's paginated history. The item pickers (`listAllIngredientsForPicker`/`listAllMenusForPicker` in `api/stock-history.service.ts`) are self-contained fetches (`page:1, per_page:100`), mirroring the same idiom used by `recipe/components/RecipeManager.tsx` and `product-discount/components/ProductDiscountForm.tsx`, rather than importing `ingredient`'s or `menu`'s own paginated services.

`IngredientStockMovement`/`MenuStockMovement` (`entities/stock-movement/model/stock-movement.types.ts`) have the same shape except for the item-id field name (`ingredient_id` vs `menu_id`) and `qty` being float vs integer — `lib/normalize.ts` maps both into one `NormalizedStockMovement` shape so `columns/stock-movement.columns.tsx` only needs to handle one type.

Sublayers: `api/` (movement + picker fetches), `lib/` (normalize), `components/` (source-type + item filters), `columns/`, `section/` (`StockHistorySection.tsx`, owns filter state + pagination).
