import { format } from "date-fns"

import { movementReferenceLabel, movementTypeLabel } from "@/modules/owner/stock-history/lib/labels"
import type { NormalizedStockMovement } from "@/modules/owner/stock-history/lib/normalize"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn } from "@/shared/lib/utils"

export const stockMovementColumns: CrudColumn<NormalizedStockMovement>[] = [
  {
    key: "created_at",
    header: "Waktu",
    render: (row) => (row.createdAt ? format(new Date(row.createdAt), "d MMM yyyy HH:mm") : "—"),
  },
  {
    key: "type",
    header: "Jenis",
    render: (row) => (
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
        {movementTypeLabel(row.type)}
      </span>
    ),
  },
  {
    key: "qty",
    header: "Jumlah",
    align: "right",
    className: "tabular-nums",
    render: (row) => (
      <span className={cn("font-semibold", row.qty < 0 ? "text-destructive" : "text-emerald-600")}>
        {row.qty > 0 ? `+${row.qty}` : row.qty}
      </span>
    ),
  },
  {
    key: "stock_change",
    header: "Stok Sebelum → Sesudah",
    align: "right",
    className: "tabular-nums text-muted-foreground",
    render: (row) => `${row.stockBefore} → ${row.stockAfter}`,
  },
  {
    key: "reference",
    header: "Asal Perubahan",
    render: (row) => movementReferenceLabel(row.referenceType, row.referenceId),
  },
  {
    key: "notes",
    header: "Keterangan",
    className: "max-w-64 truncate",
    render: (row) => row.notes || "—",
  },
  {
    key: "created_by_name",
    header: "Oleh",
    render: (row) => row.createdByName || "—",
  },
]
