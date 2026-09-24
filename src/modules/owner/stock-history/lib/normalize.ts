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
  qty: number
  stockBefore: number
  stockAfter: number
  referenceType: string
  referenceId?: number
  notes?: string
  createdByName?: string
  createdAt: string
}

export function normalizeIngredientMovement(m: IngredientStockMovement): NormalizedStockMovement {
  return {
    id: m.id ?? 0,
    type: m.type ?? "",
    qty: m.qty ?? 0,
    stockBefore: m.stock_before ?? 0,
    stockAfter: m.stock_after ?? 0,
    referenceType: m.reference_type ?? "",
    referenceId: m.reference_id,
    notes: m.notes,
    createdByName: m.created_by_name,
    createdAt: m.created_at ?? "",
  }
}

export function normalizeMenuMovement(m: MenuStockMovement): NormalizedStockMovement {
  return {
    id: m.id ?? 0,
    type: m.type ?? "",
    qty: m.qty ?? 0,
    stockBefore: m.stock_before ?? 0,
    stockAfter: m.stock_after ?? 0,
    referenceType: m.reference_type ?? "",
    referenceId: m.reference_id,
    notes: m.notes,
    createdByName: m.created_by_name,
    createdAt: m.created_at ?? "",
  }
}
