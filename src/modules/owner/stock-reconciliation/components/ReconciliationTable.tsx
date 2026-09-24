import { CheckCircle2Icon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

// Structural, not the generated response type directly — ingredient/menu
// reconciliation items only differ by their id field name (ingredient_id vs
// menu_id), which this table never needs to render.
interface ReconciliationRow {
  name?: string
  stock_in_table?: number
  stock_from_last_movement?: number
}

interface ReconciliationTableProps {
  rows: ReconciliationRow[]
  isLoading: boolean
  unit?: string
}

// An empty result here is the healthy case — unlike every other table in
// this app, so this gets its own celebratory empty state instead of the
// usual neutral "belum ada data" message.
export function ReconciliationTable({ rows, isLoading, unit }: ReconciliationTableProps) {
  if (!isLoading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
        <CheckCircle2Icon className="size-6 text-emerald-600" />
        <p className="text-sm font-medium text-foreground">Tidak ada selisih</p>
        <p className="text-xs text-muted-foreground">
          Stok di tabel sudah sesuai dengan riwayat pergerakan terakhir.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Stok di Tabel</TableHead>
          <TableHead>Stok dari Movement Terakhir</TableHead>
          <TableHead>Selisih</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Memuat...
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, index) => {
            const inTable = row.stock_in_table ?? 0
            const lastMovement = row.stock_from_last_movement ?? 0
            const diff = inTable - lastMovement
            return (
              <TableRow key={index}>
                <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                <TableCell>
                  {inTable} {unit}
                </TableCell>
                <TableCell>
                  {lastMovement} {unit}
                </TableCell>
                <TableCell>
                  <span className={cn("font-semibold", diff !== 0 && "text-destructive")}>
                    {diff > 0 ? `+${diff}` : diff} {unit}
                  </span>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
