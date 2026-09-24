# modules/owner/recipe

Bill-of-materials linking a `by_ingredient` menu to the `Ingredient`s it consumes per unit sold (e.g. Cafe Latte → coffee beans + milk). Backed by `pos-kasir-be`'s `internal/master/recipe`: plain JSON CRUD at `/master/recipes` (`GET/POST/PUT/DELETE`, `:id` variants), filterable by `?menu_id=`.

Fields: `menu_id`, `ingredient_id`, `quantity` (qty of ingredient consumed per 1 unit of menu sold). `PUT` only changes `quantity` — `menu_id`/`ingredient_id` are immutable; delete + recreate to repoint a row to a different ingredient.

## Unit conversion (FE-only)

`Recipe.quantity` has no unit of its own on the backend — it's always interpreted directly in the linked `Ingredient`'s own unit, with no conversion. Without help, storing an ingredient as `unit: "kg"` and entering a recipe quantity of `15` intending "15 grams" would actually deduct 15 **kg** per sale. `lib/unit-conversion.ts` works around this purely on the client: the recipe form lets you enter a per-serving amount in whichever unit is most natural (e.g. "gram") and converts it to the ingredient's actual unit (e.g. "kg") before sending the payload — same for editing an existing row. Only mass (`gram`↔`kg`) and volume (`ml`↔`liter`) are supported; any other unit (e.g. `pcs`, `dus`) has no known conversion and the entry unit is locked to the ingredient's own unit. The backend only ever sees one already-converted number, rounded to 3 decimals to match its `decimal(18,3)` column.

## Deliberately embedded-only, no standalone route

Recipes are always menu-scoped — the backend's own primary access pattern is `?menu_id=`, and there's no cross-menu "all recipes" use case. Rather than a separate master page with a menu picker (which would just re-derive context the Menu edit screen already has), `components/RecipeManager.tsx` is embedded directly in `modules/owner/menu/components/MenuForm.tsx`, shown only when editing an existing menu with `stock_deduction_method === "by_ingredient"`.

Sublayers: `api/` (service), `schemas/` (zod, for the "add ingredient to recipe" row), `components/` (`RecipeManager.tsx`).
