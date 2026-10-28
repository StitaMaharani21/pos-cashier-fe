import { PackageIcon, PencilIcon, PlusIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react"

import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { Quantity } from "@/shared/ui/quantity"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

interface IngredientColumnsArgs {
  // Stok masuk (goods received) — recorded as "Stok masuk" in Riwayat Stok.
  onAddStock?: (row: Ingredient) => void
  // Correction up or down — recorded as "Penyesuaian".
  onAdjustStock: (row: Ingredient) => void
  // Omitted = the role can't edit / delete.
  onEdit?: (row: Ingredient) => void
  onDelete?: (row: Ingredient) => void
}

export function ingredientColumns({ onAddStock, onAdjustStock, onEdit, onDelete }: IngredientColumnsArgs): CrudColumn<Ingredient>[] {
  return [
    {
      key: "name",
      header: "Bahan Baku",
      render: (row) => <TitleCell leading={<IconTile icon={PackageIcon} />} title={row.name} subtitle={`Satuan: ${row.unit}`} />,
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
            <Quantity
              value={row.stock ?? 0}
              unit={row.unit}
              className={low ? "font-bold text-destructive" : "font-semibold"}
            />
          </span>
        )
      },
    },
    {
      key: "min_stock",
      header: "Stok Minimum",
      align: "right",
      className: "tabular-nums text-muted-foreground",
      render: (row) => <Quantity value={row.min_stock ?? 0} unit={row.unit} />,
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
      className: "w-44",
      render: (row) => (
        <RowActions>
          {onAddStock && <RowActionButton icon={PlusIcon} label={`Tambah stok ${row.name}`} onClick={() => onAddStock(row)} />}
          <RowActionButton icon={SlidersHorizontalIcon} label={`Sesuaikan stok ${row.name}`} onClick={() => onAdjustStock(row)} />
          {onEdit && <RowActionButton icon={PencilIcon} label={`Ubah ${row.name}`} onClick={() => onEdit(row)} />}
          {onDelete && (
            <RowActionButton icon={Trash2Icon} tone="danger" label={`Hapus ${row.name}`} onClick={() => onDelete(row)} />
          )}
        </RowActions>
      ),
    },
  ]
}
