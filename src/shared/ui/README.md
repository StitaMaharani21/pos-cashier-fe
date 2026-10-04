# shared/ui

shadcn/radix primitives plus the app's own building blocks. This file documents the patterns several screens must share.

## Tabel

Every list in the owner dashboard follows one pattern. The Menu / Kategori Menu tables are the reference. Don't hand-roll table markup — compose these pieces.

**Page layout** (`flex flex-col gap-6`):
1. `page-header` — `PageHeader({ title, description })`: `h1` plus a one-line subtitle, e.g. "12 voucher terdaftar".
2. `table-toolbar` — `TableToolbar`:
   - Search with an icon.
   - Filters passed as children (`filter-select`'s "Status: Semua ▾").
   - "Reset filter" while filtering.
   - The primary "+ Tambah …" button on the right.
3. The table in a card, with `TablePagination` (`table-pagination`) as its footer.

**Tables:**
- `crud/CrudTable` — the standard table:
  - Takes columns (`CrudColumn`: `align: "right"` for numbers and money, `className` for width or wrapping).
  - Renders the card, the uppercase header, and the skeleton / empty (`empty={{ icon, title, hint }}`) / error (`isError`, `onRetry`) rows.
  - Has a `footer` slot.
- `crud/CrudSection` — a whole page on top of a `CrudService`:
  - Client-side search, status filter and paging (`hooks/useClientTable`).
  - An automatic "Aksi" column (Edit + Hapus with confirmation).
  - The form in a dialog or a sheet.
- Hand-written tables (drag reorder, inline switches) use the primitives in `table` — `TableCard`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell` — which already carry the look, plus the `table-states` rows (`TableSkeletonRows`, `TableEmptyRow`, `TableErrorRow`).

**Cells:**
- First column: `table-cells`' `TitleCell` (tile / avatar / photo + bold name + muted second line), with `IconTile` for an icon.
- Status: `status-badge` ("● Aktif" / "● Nonaktif"). A quick toggle is a `Switch`.
- Numbers and money: right-aligned `tabular-nums`. An empty value is "—".

**Row actions:**
- Rows are **not** clickable. Actions live in the last "Aksi" column: `row-actions`' `RowActions` + `RowActionButton` (outline icon buttons with `aria-label`/`title`).
  - Edit = `PencilIcon`.
  - Lihat = `EyeIcon`.
  - Hapus = `Trash2Icon` with `tone="danger"`.
  - One custom icon if needed.
  - At most 3 per row.
- Deleting always goes through `confirm-dialog`'s `ConfirmDialog`.

**Two screens on one page:** `page-tabs`' `PageTabs` (underlined tabs with count badges, state in `?tab=`) — Menu (Kategori | Menu), Pengguna (Akun Kasir | Perangkat Kasir).

**Paging:** 10 rows per page (`TABLE_PER_PAGE` in `hooks/useClientTable`), for both client-side and server-side paging.
