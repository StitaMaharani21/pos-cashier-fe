import { PackageIcon, PencilIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react"

import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

interface IngredientColumnsArgs {
  onAdjustStock: (row: Ingredient) => void
  // Omitted = the role can't edit / delete.
  onEdit?: (row: Ingredient) => void
  onDelete?: (row: Ingredient) => void
}

export function ingredientColumns({ onAdjustStock, onEdit, onDelete }: IngredientColumnsArgs): CrudColumn<Ingredient>[] {
  return [
    {
      key: "name",
      header: "Bahan Baku",
      render: (row) => <TitleCell leading={<IconTile icon={PackageIcon} />} title={row.name} subtitle={row.unit} />,
    },
    {
      key: "stock",
      header: "Stok",
      align: "right",
      className: "tabular-nums",
      render: (row) => {
        const low = (row.stock ?? 0) <= (row.min_stock ?? 0)
        return (
          <span className="inline-flex items-center gap-2">
            {low && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">Menipis</span>
            )}
            <span className={low ? "font-bold text-destructive" : "font-semibold"}>
              {row.stock ?? 0} {row.unit}
            </span>
          </span>
        )
      },
    },
    {
      key: "min_stock",
      header: "Stok Minimum",
      align: "right",
      className: "tabular-nums text-muted-foreground",
      render: (row) => `${row.min_stock ?? 0} ${row.unit}`,
    },
    {
      key: "purchase_price",
      header: "Harga Beli",
      align: "right",
      className: "tabular-nums",
      render: (row) => formatRupiah(row.purchase_price ?? 0),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "w-36",
      render: (row) => (
        <RowActions>
          <RowActionButton icon={SlidersHorizontalIcon} label={`Sesuaikan stok ${row.name}`} onClick={() => onAdjustStock(row)} />
          {onEdit && <RowActionButton icon={PencilIcon} label={`Edit ${row.name}`} onClick={() => onEdit(row)} />}
          {onDelete && (
            <RowActionButton icon={Trash2Icon} tone="danger" label={`Hapus ${row.name}`} onClick={() => onDelete(row)} />
          )}
        </RowActions>
      ),
    },
  ]
}
