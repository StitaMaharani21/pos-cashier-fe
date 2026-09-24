import type { CrudColumn } from "@/shared/api/crud/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

interface CrudTableProps<T> {
  columns: CrudColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string | number
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export function CrudTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyMessage = "Belum ada data",
  onRowClick,
}: CrudTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center text-muted-foreground"
            >
              Memuat...
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={getRowId(row)}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer" : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[column.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
