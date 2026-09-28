import type { ReactNode } from "react"

import type { CrudColumn } from "@/shared/api/crud/types"
import { cn } from "@/shared/lib/utils"
import { Table, TableBody, TableCard, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { TableEmptyRow, TableErrorRow, TableSkeletonRows, type TableEmptyState } from "@/shared/ui/table-states"

interface CrudTableProps<T> {
  columns: CrudColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string | number
  isLoading?: boolean
  isError?: boolean
  errorHint?: string
  onRetry?: () => void
  // Shown when rows is empty (after loading, without error).
  empty?: TableEmptyState
  // Under the table, inside the card: totals, TablePagination.
  footer?: ReactNode
  // Horizontal scroll kicks in below this width, e.g. "min-w-[760px]".
  minWidth?: string
}

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const

// The standard owner table (see shared/ui/README.md "Tabel"): card, uppercase
// header, skeleton / empty / error rows, footer slot. Rows aren't clickable —
// actions live in an "Aksi" column (RowActions).
export function CrudTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  isError,
  errorHint,
  onRetry,
  empty = { title: "Belum ada data" },
  footer,
  minWidth = "min-w-[720px]",
}: CrudTableProps<T>) {
  const alignOf = (column: CrudColumn<T>) => ALIGN[column.align ?? (column.key === "actions" ? "right" : "left")]

  return (
    <TableCard footer={footer}>
      <Table className={minWidth}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={cn(alignOf(column), column.className)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows colSpan={columns.length} />
          ) : isError ? (
            <TableErrorRow colSpan={columns.length} hint={errorHint} onRetry={onRetry} />
          ) : rows.length === 0 ? (
            <TableEmptyRow colSpan={columns.length} {...empty} />
          ) : (
            rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={cn(alignOf(column), column.className)}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableCard>
  )
}
