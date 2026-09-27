# modules/owner/menu-category

Organize menu items into categories — the "Kategori Menu" tab of `/app/menu` (see `modules/owner/menu`'s `MenuCatalogSection`). Backed by `pos-kasir-be`'s `internal/master/menu_category`:

- `GET /master/menu-categories` — ordered by `urutan` (`sort_order`), each row with `menu_count` (list endpoint only). A store has a handful, so they're fetched in one page and search / the status filter / paging are client-side.
- `POST` / `PUT /:id` — JSON `name`, `description`, `status`. `sort_order` is sent as 0: the backend appends a new category last and keeps the current position on edit. The form has no order field.
- `PUT /master/menu-categories/reorder` `{ids}` — drag-to-reorder (same slot rules as menus, `internal/common/ordering`), via `shared/hooks/useRowReorder`.
- `DELETE /:id` — the confirm dialog blocks it while the category still has menus.

The row icon isn't stored by the backend: `constants/category-icon.ts` picks one from the name (Makanan → utensils, Minuman → cup, Camilan → cookie, Dessert → cake, Paket → package; anything else a tag in a colour derived from the id).

Sublayers: `api/` (`menu-category.service.ts`), `components/` (`MenuCategoryForm`), `constants/` (`category-icon`, `query-keys` — `MENU_CATEGORIES_KEY`, shared with the Menu tab's filter/form and the tab badge), `schemas/` (zod), `section/` (`MenuCategorySection.tsx`).
