import type {
  IngredientStockMovement,
  MenuStockMovement,
} from "@/entities/stock-movement/model/stock-movement.types"

// IngredientStockMovement and MenuStockMovement are the same shape except
// for the item-id field name (ingredient_id vs menu_id) and qty being
// float vs integer — normalized here so the table/columns don't need to
// know which source they're rendering.
export interface NormalizedStockMovement {
  id: number
  type: string
  // Signed change: positive = stock in, negative = stock out. The backend's
  // `qty` is always positive, so the direction comes from `delta`.
  delta: number
  stockBefore: number
  stockAfter: number
  referenceType: string
  referenceId?: number
  notes?: string
  createdByName?: string
  createdAt: string
}

function normalize(m: IngredientStockMovement | MenuStockMovement): NormalizedStockMovement {
  const stockBefore = m.stock_before ?? 0
  const stockAfter = m.stock_after ?? 0
  return {
    id: m.id ?? 0,
    type: m.type ?? "",
    // Rounded: ingredient stock is a float (decimal(18,3)).
    delta: m.delta ?? Math.round((stockAfter - stockBefore) * 1000) / 1000,
    stockBefore,
    stockAfter,
    referenceType: m.reference_type ?? "",
    referenceId: m.reference_id,
    notes: m.notes,
    createdByName: m.created_by_name,
    createdAt: m.created_at ?? "",
  }
}

export const normalizeIngredientMovement = (m: IngredientStockMovement) => normalize(m)
export const normalizeMenuMovement = (m: MenuStockMovement) => normalize(m)
