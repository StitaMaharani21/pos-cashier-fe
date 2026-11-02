import type { Recipe } from "@/entities/recipe/model/recipe.types"
import { convertUnit, getSmallestUnit, roundUnitValue } from "@/modules/owner/recipe/lib/unit-conversion"

const quantityFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 })

// 0.05 → "0,05", 1250 → "1.250" — the way an owner reads amounts.
export function formatQuantity(value: number): string {
  return quantityFormat.format(value)
}

// A recipe line as the owner thinks of it: in the friendliest unit of the
// ingredient's group (gram for kg, ml for liter), not the stock unit it is
// stored in.
export function recipeLineAmount(row: Recipe): { qty: number; unit: string; rawQty: number; rawUnit: string } {
  const rawUnit = row.ingredient_unit ?? ""
  const unit = getSmallestUnit(rawUnit) || rawUnit
  return {
    qty: roundUnitValue(convertUnit(row.quantity ?? 0, rawUnit, unit)),
    unit,
    rawQty: row.quantity ?? 0,
    rawUnit,
  }
}

// "Biji kopi 18 gram"
export function recipeLineText(row: Recipe): string {
  const { qty, unit } = recipeLineAmount(row)
  return `${row.ingredient_name ?? "Bahan"} ${formatQuantity(qty)} ${unit}`.trim()
}
