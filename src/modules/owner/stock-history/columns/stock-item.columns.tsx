import { HistoryIcon, PackageIcon, PlusIcon, UtensilsIcon } from "lucide-react"

import type { StockItem } from "@/modules/owner/stock-history/lib/stock-item"
import type { CrudColumn } from "@/shared/api/crud/types"
import { Quantity } from "@/shared/ui/quantity"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

interface StockItemColumnsArgs {
  onViewHistory: (item: StockItem) => void
  // Omitted = the role can't add stock.
  onAddStock?: (item: StockItem) => void
}

function isLow(item: StockItem): boolean {
  if (item.stock == null) return false
  return item.source === "ingredient" ? item.stock <= (item.minStock ?? 0) : item.stock <= 0
}

export function stockItemColumns({ onViewHistory, onAddStock }: StockItemColumnsArgs): CrudColumn<StockItem>[] {
  return [
    {
      key: "name",
      header: "Nama",
      render: (item) => (
        <TitleCell
          leading={<IconTile icon={item.source === "ingredient" ? PackageIcon : UtensilsIcon} />}
          title={item.name}
          subtitle={item.source === "ingredient" ? `Satuan: ${item.unit}` : "Stok dicatat per menu"}
        />
      ),
    },
    {
      key: "stock",
      header: "Stok Saat Ini",
      align: "right",
      className: "tabular-nums",
      render: (item) => {
        if (item.stock == null) return <span className="text-muted-foreground">Belum diisi</span>
        const low = isLow(item)
        return (
          <span className="inline-flex items-center gap-2">
            {low && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                {item.source === "menu" ? "Habis" : "Menipis"}
              </span>
            )}
            <Quantity
              value={item.stock}
              unit={item.unit}
              className={low ? "font-bold text-destructive" : "font-semibold"}
            />
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "Aksi",
      className: "w-36",
      render: (item) => (
        <RowActions>
          <RowActionButton icon={HistoryIcon} label={`Lihat riwayat stok ${item.name}`} onClick={() => onViewHistory(item)} />
          {onAddStock && <RowActionButton icon={PlusIcon} label={`Tambah stok ${item.name}`} onClick={() => onAddStock(item)} />}
        </RowActions>
      ),
    },
  ]
}
