# shared/ui

shadcn/radix primitives plus the app's own building blocks. This file documents the patterns several screens must share.

## Design tokens

Everything visual comes from `src/index.css`. Don't reach past it with literal
colors, off-scale paddings or a second font stack.

- **Typeface** — Plus Jakarta Sans, wired to `--font-sans` (so the owner console
  and the public landing page render in the same face). `index.html` loads it.
- **Color** — the `--primary` / `--muted` / `--destructive` … set, plus
  `--primary-strong` for blue text and icons on light surfaces (`--primary`
  itself is too light to carry text).
- **Charts** — `--chart-1 … --chart-8`, read through
  `shared/lib/chart-colors.ts` (`chartColor(i)` to cycle, `SEMANTIC_CHART_COLORS`
  for series that must mean the same thing on every screen). Never a literal hex
  in a Recharts `fill`. Keep the number itself in `text-foreground`; the swatch
  carries the color, so a low-contrast series color never becomes label text.
- **Spacing** — the Tailwind scale only. Cards are `rounded-2xl` with
  `p-5 sm:p-6`; card titles are `text-lg font-bold sm:text-xl`. No `p-[21px]`.
- **Radius** — `rounded-2xl` for cards and table cards, `rounded-xl` for tiles
  and nested panels, `rounded-md`/`rounded-lg` for controls.

## Responsive & touch

- The owner shell (`app/layouts/OwnerLayout`) is a fixed rail from `lg` and an
  off-canvas `Sheet` drawer below it, opened by the header's hamburger. Page
  padding is `p-4 sm:p-6 lg:p-8`.
- Interactive controls are **44px on touch, compact from `sm`** —
  `h-11 sm:h-9` for inputs/selects, `h-11 sm:h-10` for toolbar controls,
  `size-10 sm:size-9` for icon buttons. Keep the pattern when adding controls.
- Every clickable element gets `cursor-pointer` and a visible
  `focus-visible:ring-2 focus-visible:ring-ring`.
- A card that does something is a `<button>` (or stretches one over itself, as
  `kpi-card` does) — never an `onClick` on a `div`.

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

**Loading:** a skeleton that reserves the final height (`TableSkeletonRows`, or a
`animate-pulse` block sized like the content), never a bare "Memuat..." string —
text that is later replaced by a taller chart makes the page jump.
