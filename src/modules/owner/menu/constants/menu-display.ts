import type { Menu } from "@/entities/menu/model/menu.types"

// Prefix of every menu list query (and the tab badge's total).
export const MENUS_KEY = ["menus"]

// "Stok" column / preview row.
export function stockLabel(menu: Menu): string {
  if (menu.stock_deduction_method === "by_ingredient") return "Sesuai resep"
  if (menu.stock_deduction_method === "by_menu") return `${menu.stock_qty ?? 0} pcs`
  return "—"
}
