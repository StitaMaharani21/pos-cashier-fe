import { format } from "date-fns"

import {
  movementKind,
  movementReferenceLabel,
  type MovementTone,
} from "@/modules/owner/stock-history/lib/labels"
import type { NormalizedStockMovement } from "@/modules/owner/stock-history/lib/normalize"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatNumber } from "@/shared/lib/utils"

const BADGE_TONE: Record<MovementTone, string> = {
  in: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  out: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
}

const AMOUNT_TONE: Record<MovementTone, string> = {
  in: "text-emerald-600",
  out: "text-destructive",
  neutral: "text-muted-foreground",
}

export const stockMovementColumns: CrudColumn<NormalizedStockMovement>[] = [
  {
    key: "created_at",
    header: "Waktu",
    className: "whitespace-nowrap",
    render: (row) => (row.createdAt ? format(new Date(row.createdAt), "d MMM yyyy HH:mm") : "—"),
  },
  {
    key: "type",
    header: "Jenis",
    render: (row) => {
      const kind = movementKind(row.type, row.referenceType, row.delta)
      return (
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
            BADGE_TONE[kind.tone]
          )}
        >
          {kind.label}
        </span>
      )
    },
  },
  {
    key: "delta",
    header: "Jumlah",
    align: "right",
    className: "tabular-nums",
    render: (row) => {
      const tone = movementKind(row.type, row.referenceType, row.delta).tone
      return (
        <span className={cn("font-semibold", AMOUNT_TONE[tone])}>
          {row.delta > 0 ? "+" : row.delta < 0 ? "−" : ""}
          {formatNumber(Math.abs(row.delta))}
        </span>
      )
    },
  },
  {
    key: "stock_change",
    header: "Stok Sebelum → Sesudah",
    align: "right",
    className: "tabular-nums text-muted-foreground whitespace-nowrap",
    render: (row) => `${formatNumber(row.stockBefore)} → ${formatNumber(row.stockAfter)}`,
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
