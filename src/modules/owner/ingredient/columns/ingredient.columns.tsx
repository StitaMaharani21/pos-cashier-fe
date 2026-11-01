import { ArrowRightLeftIcon, HistoryIcon, PackageIcon, PencilIcon } from "lucide-react"

import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { Quantity } from "@/shared/ui/quantity"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { StatusBadge } from "@/shared/ui/status-badge"
import { StatusToggle } from "@/shared/ui/status-toggle"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

interface IngredientColumnsArgs {
  // Opens Riwayat Stok, the only place stock is changed (Ubah Stok: goods
  // received or a correction).
  onManageStock: (row: Ingredient) => void
  // Opens the purchase-price history (every change of the harga beli).
  onViewPriceHistory: (row: Ingredient) => void
  // Omitted = the role can't edit.
  onEdit?: (row: Ingredient) => void
  // Switch the ingredient on/off — ingredients are never deleted. Omitted = the
  // role can't edit.
  onToggleStatus?: (row: Ingredient) => void
}

export function ingredientColumns({ onManageStock, onViewPriceHistory, onEdit, onToggleStatus }: IngredientColumnsArgs): CrudColumn<Ingredient>[] {
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
      key: "status",
      header: "Status",
      render: (row) =>
        onToggleStatus ? (
          <StatusToggle active={row.status !== "inactive"} label={row.name ?? "bahan baku"} onToggle={() => onToggleStatus(row)} />
        ) : (
          <StatusBadge active={row.status !== "inactive"} />
        ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "w-44",
      render: (row) => (
        <RowActions>
          <RowActionButton icon={ArrowRightLeftIcon} label={`Kelola stok ${row.name} di Riwayat Stok`} onClick={() => onManageStock(row)} />
          <RowActionButton icon={HistoryIcon} label={`Riwayat harga beli ${row.name}`} onClick={() => onViewPriceHistory(row)} />
          {onEdit && <RowActionButton icon={PencilIcon} label={`Ubah ${row.name}`} onClick={() => onEdit(row)} />}
        </RowActions>
      ),
    },
  ]
}
