import { format } from "date-fns"

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
    header: "Tipe",
    render: (row) => (
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase">
        {row.type}
      </span>
    ),
  },
  {
    key: "qty",
    header: "Jumlah",
    render: (row) => (
      <span className={cn("font-semibold", row.qty < 0 ? "text-destructive" : "text-emerald-600")}>
        {row.qty > 0 ? `+${row.qty}` : row.qty}
      </span>
    ),
  },
  {
    key: "stock_change",
    header: "Stok Sebelum → Sesudah",
    render: (row) => `${row.stockBefore} → ${row.stockAfter}`,
  },
  {
    key: "reference",
    header: "Referensi",
    render: (row) => (row.referenceId ? `${row.referenceType} #${row.referenceId}` : row.referenceType || "—"),
  },
  {
    key: "notes",
    header: "Keterangan",
    render: (row) => row.notes || "—",
  },
  {
    key: "created_by_name",
    header: "Oleh",
    render: (row) => row.createdByName || "—",
  },
]
