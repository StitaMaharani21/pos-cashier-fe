// GET /master/price-history — every change of a menu's selling price, an addon
// option's price or a bahan baku's purchase price (harga lama → baru, siapa,
// kapan, dari mana). Not in the generated schema yet.
export type PriceHistoryEntityType = "menu" | "addon_option" | "ingredient"

// CREATE = first price, UPDATE = edited in the form, STOCK_IN = purchase price
// changed by a "Stok Masuk", BACKFILL = the price when history started.
export type PriceHistorySource = "CREATE" | "UPDATE" | "STOCK_IN" | "BACKFILL"

export interface PriceHistoryEntry {
  id: number
  entity_type: PriceHistoryEntityType
  entity_id: number
  price: number
  // null on the first record of an item.
  previous_price: number | null
  source: PriceHistorySource
  created_by_name: string
  created_at: string
}
