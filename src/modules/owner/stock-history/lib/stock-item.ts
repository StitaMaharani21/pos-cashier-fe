import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { Menu } from "@/entities/menu/model/menu.types"

export type StockSource = "ingredient" | "menu"

// One row of the Riwayat Stok list: a bahan baku or a per-menu tracked menu,
// reduced to what the list, the movements sheet and the add-stock dialog need.
export interface StockItem {
  source: StockSource
  id: number
  name: string
  // "kg", "gram", ... for a bahan baku; menus are counted in "pcs".
  unit: string
  // null = never set (menu stock the owner hasn't filled in yet).
  stock: number | null
  // Bahan baku only: the "Menipis" threshold and the current purchase price.
  minStock?: number
  purchasePrice?: number
}

export function ingredientToStockItem(row: Ingredient): StockItem {
  return {
    source: "ingredient",
    id: row.id ?? 0,
    name: row.name ?? "",
    unit: row.unit ?? "",
    stock: row.stock ?? 0,
    minStock: row.min_stock,
    purchasePrice: row.purchase_price,
  }
}

export function menuToStockItem(row: Menu): StockItem {
  return {
    source: "menu",
    id: row.id ?? 0,
    name: row.name ?? "",
    unit: "pcs",
    stock: row.stock_qty ?? null,
  }
}
