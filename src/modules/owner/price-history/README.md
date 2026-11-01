# modules/owner/price-history

Riwayat harga: every change of a menu's selling price, an addon option's price or a bahan baku's purchase price — harga lama → baru, siapa, kapan and where it came from (`CREATE` first price, `UPDATE` edited in the form, `STOCK_IN` purchase price changed by a *Stok Masuk*, `BACKFILL` the price when history started). Backed by `pos-kasir-be`'s `GET /master/price-history?entity_type=menu|addon_option|ingredient&entity_id=&page=&per_page=` (owner only, every plan), newest first.

`components/PriceHistorySheet.tsx` is a side Sheet opened from the menu list and the menu form (*Riwayat harga*) and from the bahan baku list (*Riwayat harga beli*). Addon option history is recorded by the backend but has no screen yet. Types live in `entities/price-history` (not in the generated schema).

**Why it exists.** A price is overwritten in place, so without a trail nobody can tell why a number changed. Sales reports do **not** read this table: each order keeps the unit price, addon price, discount and tax it was sold at, and its cost (HPP). A price change only affects new orders.

Sublayers: `api/` (list), `components/` (`PriceHistorySheet`).
