import { SlidersHorizontalIcon } from "lucide-react"

import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"

interface IngredientColumnsArgs {
  onAdjustStock: (row: Ingredient) => void
}

export function ingredientColumns({ onAdjustStock }: IngredientColumnsArgs): CrudColumn<Ingredient>[] {
  return [
    {
      key: "name",
      header: "Nama Bahan",
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      key: "stock",
      header: "Stok",
      render: (row) => {
        const low = (row.stock ?? 0) <= (row.min_stock ?? 0)
        return (
          <span className={cn("font-medium", low && "font-bold text-destructive")}>
            {row.stock ?? 0} {row.unit}
          </span>
        )
      },
    },
    {
      key: "min_stock",
      header: "Stok Minimum",
      render: (row) => `${row.min_stock ?? 0} ${row.unit}`,
    },
    {
      key: "purchase_price",
      header: "Harga Beli",
      render: (row) => formatRupiah(row.purchase_price ?? 0),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAdjustStock(row)
          }}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <SlidersHorizontalIcon className="size-3.5" />
          Sesuaikan Stok
        </button>
      ),
    },
  ]
}
