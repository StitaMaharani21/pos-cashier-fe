# modules/owner/menu-addon

"Addon Menu" (`/app/menu-addon`, sidebar → Master Data): paid extras a customer can pick on a menu, e.g. a "Tambahan" group with *Gula +Rp5.000*. A group is created once and attached to as many menus as needed; the QR self-order page (`modules/public/self-order`'s `ItemSheet`) and the cashier app read the groups from the menu detail and add the picked options' prices to the line total.

Backed by `pos-kasir-be`'s `internal/master/menu_addon` (owner only):

- `GET /master/addon-groups?page&per_page` — each group with its `options` and `menu_ids` (the menus it's attached to). A store has a handful, so one page of 100 is fetched and search / the status filter / paging are client-side (`shared/ui/crud/CrudSection`).
- `POST /master/addon-groups` — group + nested `options` (at least one). `sort_order` is `total + 1`: the backend stores it as sent, so a new group goes last.
- `PUT /master/addon-groups/:id` — group fields only (`name`, `is_required`, `max_select`, `sort_order`, `status`); the form keeps the group's current `sort_order`.
- `POST` / `PUT` / `DELETE /:id/options[/:optionId]` — the options are managed one by one. On save the service diffs the form against the group as it was opened (`AddonGroupDraft.original`): removed options are deleted, kept ones updated (their position in the form becomes `sort_order`), new ones added.
- `POST /:id/menus` `{menu_id}` / `DELETE /:id/menus/:menuId` — attach / detach, diffed the same way against `original.menu_ids`. If some of these fail the group itself is already saved; the error says how many menus didn't update.
- `DELETE /:id` — removes the group with its options and menu links.

`max_select` on the wire: `1` = pick one (radio on the customer page), `0` = no limit, `n > 1` = up to n. The form shows it as "Pilih satu" / "Boleh lebih dari satu" + an optional maximum. `is_required` = "Wajib dipilih". An inactive group or option isn't offered to customers.

`menu_ids` on the list response was added to the backend for this screen (`menu_addon` DTO + `FindMenuIDsByGroupIDs`); before it the owner API couldn't say which menus a group was attached to.

Types are hand-written in `entities/menu-addon` (the generator's allow-list in `scripts/generate-owner-types.mjs` doesn't include `/master/addon-groups`; adding it and regenerating also renames several shared `dto.*` types, so that's a separate change).

Gated by `routeAccess["menu-addon"]` = `pos` feature + `menu` module (same as Menu).

Sublayers: `api/` (`menu-addon.service.ts` — a `CrudService` whose create/update fan out to the option and menu endpoints, plus `listAllMenus` for the picker), `columns/`, `components/` (`AddonGroupForm.tsx` — drawer with the group, selection rules, options and the menu picker), `schemas/` (zod), `section/` (`MenuAddonSection.tsx`).
