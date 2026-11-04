# modules/owner/recipe

Bill-of-materials linking a `by_ingredient` menu to the `Ingredient`s it consumes per unit sold (e.g. Cafe Latte → coffee beans + milk). Backed by `pos-kasir-be`'s `internal/master/recipe`: plain JSON CRUD at `/master/recipes` (`GET/POST/PUT/DELETE`, `:id` variants), filterable by `?menu_id=`.

Fields: `menu_id`, `ingredient_id`, `quantity` (qty of ingredient consumed per 1 unit of menu sold) and an optional `addon_option_id` (see below). `PUT` only changes `quantity` — `menu_id`/`ingredient_id` are immutable; delete + recreate to repoint a row to a different ingredient.

## Recipe per serving (Hot / Ice)

A menu can have different recipes per serving. A line with `addon_option_id = null` applies to every order of the menu; a line with an option (e.g. "Ice" of the addon group "Penyajian") applies **only when that option is ordered** (`internal/transaction/orderstock` reads each order item's chosen addon options). So the Hot cup never consumes ice cubes. There is no separate variant concept — the serving is the addon option the cashier/customer already picks, which keeps carts, orders, offline sync and the mobile app unchanged.

`RecipeManager` shows a block "Semua penyajian" plus one "Khusus <opsi>" block per active option of the addon groups attached (and saved) on the menu; "+ Tambah resep khusus penyajian" opens a block for an option that has no lines yet. Each block has its own ingredient picker (the same ingredient may appear once per block, e.g. coffee in "Semua penyajian" and ice only in "Khusus Ice"). Use a required, single-choice group (`max_select = 1`) for the serving so one item never matches two serving blocks. Lines tied to an option that is no longer attached/active are kept visible (marked "tidak aktif") so they can be removed, but never apply. Inactive ingredients are not offered for new lines (the backend rejects them with `INGREDIENT_INACTIVE`).

**Making it quick to understand.** The add row has visible captions (1. Bahan baku, 2. Jumlah per porsi, Satuan) and the unit fills itself with the friendliest unit of the chosen ingredient (gram for kg, ml for liter), so the owner only types the number. While typing, a line spells out the meaning: "Setiap 1 porsi memakai 150 ml = 0,15 liter. Stok sekarang 8 liter, cukup untuk sekitar 53 porsi" (or says the stock is still 0 and where to fill it). Above the blocks, "Yang terpotong dari stok per 1 porsi" lists the final result per serving (Hot: kopi 18 gram; Ice: kopi 18 gram + es batu 50 gram), so the owner does not have to add the blocks up in their head. Each block has its own empty hint, and while a menu has no recipe yet "Salin resep dari menu lain" copies the lines of another `by_ingredient` menu (lines tied to a serving option this menu does not have are skipped and reported). Formatting helpers: `lib/recipe-format.ts`.

The explanatory text (what a recipe is, the per-serving idea, the auto unit) sits behind "i" buttons next to the "Resep / Bahan Baku" title, each block title and "Tambah bahan"; only data (the preview line, the "Yang terpotong" summary, empty-block hints) and actionable messages stay visible.

Load errors are no longer hidden: a failed recipe/ingredient load shows an error with "Coba lagi", and a 402 (store without Inventori) shows a plan message. Pressing Enter in the edit-quantity input saves that line instead of submitting the whole menu form.

## Unit conversion (FE-only)

`Recipe.quantity` has no unit of its own on the backend — it's always interpreted directly in the linked `Ingredient`'s own unit, with no conversion. Without help, storing an ingredient as `unit: "kg"` and entering a recipe quantity of `15` intending "15 grams" would actually deduct 15 **kg** per sale. `lib/unit-conversion.ts` works around this purely on the client: the recipe form lets you enter a per-serving amount in whichever unit is most natural (e.g. "gram") and converts it to the ingredient's actual unit (e.g. "kg") before sending the payload — same for editing an existing row. Only mass (`gram`↔`kg`) and volume (`ml`↔`liter`) are supported; any other unit (e.g. `pcs`, `dus`) has no known conversion and the entry unit is locked to the ingredient's own unit. The backend only ever sees one already-converted number, rounded to 3 decimals to match its `decimal(18,3)` column.

## Deliberately embedded-only, no standalone route

Recipes are always menu-scoped — the backend's own primary access pattern is `?menu_id=`, and there's no cross-menu "all recipes" use case. Rather than a separate master page with a menu picker (which would just re-derive context the Menu edit screen already has), `components/RecipeManager.tsx` is embedded directly in `modules/owner/menu/components/MenuForm.tsx`, shown only when editing an existing menu with `stock_deduction_method === "by_ingredient"` on a plan with Inventori.

Sublayers: `api/` (service, `listMenuRecipes`, `listAllIngredients`), `schemas/` (zod, for the "add ingredient to recipe" row), `components/` (`RecipeManager.tsx` — loads data, the per-serving summary, copy-from-menu and the blocks; `RecipeSection.tsx` — one block of lines + its add form), `lib/` (`unit-conversion`, `recipe-format`).
