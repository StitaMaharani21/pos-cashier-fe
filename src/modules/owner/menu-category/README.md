# modules/owner/menu-category

Organize menu items into categories. Backed by `pos-kasir-be`'s `internal/master/menu_category`: plain JSON CRUD at `/master/menu-categories` (`GET/POST/PUT/DELETE`, `:id` variants) — fits `shared/api/crud/createCrudService` directly, no overrides needed.

Fields: `name`, `description`, `sort_order`, `status`.

Sublayers: `components/` (form fields), `schemas/` (zod), `columns/` (`CrudColumn<MenuCategory>[]`), `section/` (`MenuCategorySection.tsx`).
