import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

export type StockHistorySourceType = "ingredient" | "menu"

interface StockHistoryFiltersProps {
  sourceType: StockHistorySourceType
  onSourceTypeChange: (type: StockHistorySourceType) => void
  items: Ingredient[] | Menu[]
  selectedId: number | null
  onSelectedIdChange: (id: number) => void
}

// Source-type toggle mirrors the percent/fixed segmented control used in
// the discount forms (two Button toggles, feature-local).
export function StockHistoryFilters({
  sourceType,
  onSourceTypeChange,
  items,
  selectedId,
  onSelectedIdChange,
}: StockHistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={sourceType === "ingredient" ? "default" : "outline"}
          onClick={() => onSourceTypeChange("ingredient")}
        >
          Bahan Baku
        </Button>
        <Button
          type="button"
          variant={sourceType === "menu" ? "default" : "outline"}
          onClick={() => onSourceTypeChange("menu")}
        >
          Menu
        </Button>
      </div>

      <Select
        value={selectedId != null ? String(selectedId) : undefined}
        onValueChange={(value) => onSelectedIdChange(Number(value))}
      >
        <SelectTrigger className="min-w-[240px]">
          <SelectValue
            placeholder={sourceType === "ingredient" ? "Pilih bahan baku..." : "Pilih menu..."}
          />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
