# modules/owner/stock-history

Riwayat Stok: every item whose stock is tracked, and the stock turnover of each — what came in and what went out.

**List** (`section/StockHistorySection.tsx`): two tabs (`?tab=menu`, default Bahan Baku), each a server-paged, searchable table of items — Nama, Stok Saat Ini, and an "Aksi" column with *Lihat riwayat* and *Tambah stok*. Bahan Baku uses `listIngredients`; Menu lists only menus counted per item (`listMenus({ stockDeductionMethod: "by_menu" })` → `GET /master/menus?stock_deduction_method=by_menu`). Menus that deduct through their recipe (`by_ingredient`) have no stock of their own — their turnover is the bahan baku's. Rows are normalised to `StockItem` (`lib/stock-item.ts`).

**Turnover** (`components/StockMovementsSheet.tsx`): a side Sheet per item with Total masuk / Total keluar cards (`total_in` / `total_out` of the movements endpoint — all pages, not affected by the filter), a Semua / Masuk / Keluar filter (`direction=in|out`) and the paginated movement table (`columns/stock-movement.columns.tsx`). Backed by `GET /master/ingredients/{id}/stock-movements` and `GET /master/menus/{id}/stock-movements` (owner-only).

**Direction and kind.** The backend stores `qty` as an absolute value; the signed change is `delta` (`stock_after − stock_before`, `lib/normalize.ts` falls back to computing it). The "Jenis" badge comes from `movementKind` (`lib/labels.ts`): `IN`+`PURCHASE` = *Stok masuk* (green), `IN`+`ORDER` = *Pembatalan pesanan* (stock restored when an order is cancelled, green), `OUT` = *Penjualan* (red), `ADJUSTMENT` = *Penyesuaian (+/−)* by the sign of `delta`.

**Tambah Stok** (`components/AddStockDialog.tsx`, also the "+" action of the Bahan Baku table): jumlah, harga beli per satuan (bahan baku only, optional — updates the ingredient's harga beli) and keterangan. Saves immediately via `POST /master/ingredients/{id}/stock-in` / `POST /master/menus/{id}/stock-in` (`api/stock-history.service.ts`), recorded as *Stok masuk*. It invalidates `ingredients`, `menus`, `stock-movements` and `stock-reconciliation`. "Sesuaikan stok" (bahan baku) stays for corrections up or down (*Penyesuaian*).

Every stock change now leaves a movement: sales, cancellations, stock-in, adjustments, setting a menu's stock from the menu form (`PUT /master/menus/{id}/stock` is recorded as a *Penyesuaian* of the difference), and a new ingredient's initial stock ("Stok awal"). Items changed before this were not recorded, so *Cek Selisih Stok* can still list them.

Sublayers: `api/` (movement lists + stock-in), `lib/` (`stock-item`, `normalize`, `labels`), `components/` (`StockMovementsSheet`, `AddStockDialog`), `columns/` (`stock-item.columns`, `stock-movement.columns`), `schemas/` (`add-stock.schema.ts`), `section/` (`StockHistorySection.tsx`).
