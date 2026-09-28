import { CheckCircle2Icon } from "lucide-react"

import type { CrudColumn } from "@/shared/api/crud/types"
import { CrudTable } from "@/shared/ui/crud/CrudTable"

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

function columns(unit?: string): CrudColumn<ReconciliationRow>[] {
  const withUnit = (value: number) => (unit ? `${value} ${unit}` : String(value))
  return [
    {
      key: "name",
      header: "Nama",
      render: (row) => <span className="font-bold text-foreground">{row.name}</span>,
    },
    {
      key: "stock_in_table",
      header: "Stok di Tabel",
      align: "right",
      className: "tabular-nums",
      render: (row) => withUnit(row.stock_in_table ?? 0),
    },
    {
      key: "stock_from_last_movement",
      header: "Stok dari Pergerakan Terakhir",
      align: "right",
      className: "tabular-nums",
      render: (row) => withUnit(row.stock_from_last_movement ?? 0),
    },
    {
      key: "diff",
      header: "Selisih",
      align: "right",
      className: "w-36",
      render: (row) => {
        const diff = (row.stock_in_table ?? 0) - (row.stock_from_last_movement ?? 0)
        return diff === 0 ? (
          <span className="text-muted-foreground">0</span>
        ) : (
          <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive tabular-nums">
            {diff > 0 ? `+${withUnit(diff)}` : withUnit(diff)}
          </span>
        )
      },
    },
  ]
}

// An empty result here is the healthy case — unlike every other table in
// this app, so its empty state is the green "Tidak ada selisih".
export function ReconciliationTable({ rows, isLoading, unit }: ReconciliationTableProps) {
  return (
    <CrudTable
      columns={columns(unit)}
      rows={rows}
      getRowId={(row) => row.name ?? ""}
      isLoading={isLoading}
      minWidth="min-w-[640px]"
      empty={{
        icon: CheckCircle2Icon,
        tone: "success",
        title: "Tidak ada selisih",
        hint: "Stok di tabel sudah sesuai dengan riwayat pergerakan terakhir.",
      }}
    />
  )
}
