# modules/owner/stock-reconciliation

Read-only drift report: lists any ingredient/menu whose master-table stock doesn't match the `stock_after` of its last stock movement — a non-empty result means something wrote to stock outside the normal adjustment/sale paths. Backed by `pos-kasir-be`'s `GET /master/ingredients/stock-reconciliation` and `GET /master/menus/stock-reconciliation` (both owner-only, no pagination — plain arrays, meant to normally come back empty).

These same endpoints are also polled periodically by an external n8n scheduler; this screen just gives the owner the same visibility on demand from the dashboard instead of only via an external alert.

`ReconciliationTable.tsx` takes a structural row shape (`{name, stock_in_table, stock_from_last_movement}`) rather than the generated response types directly, since ingredient/menu reconciliation items only differ by an id field this table doesn't render — one component serves both sections in `section/StockReconciliationSection.tsx`.

Sublayers: `api/` (two plain GET fetches), `components/` (`ReconciliationTable.tsx`), `section/` (`StockReconciliationSection.tsx`, two stacked sections) — no `columns/`/`schemas/`, there's no table-column abstraction or form here.
