import { ArmchairIcon } from "lucide-react"

import type { Table } from "@/entities/table/model/table.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { StatusBadge } from "@/shared/ui/status-badge"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

export const tableColumns: CrudColumn<Table>[] = [
  {
    key: "number",
    header: "Meja",
    render: (row) => <TitleCell leading={<IconTile icon={ArmchairIcon} />} title={`Meja ${row.number}`} />,
  },
  {
    key: "status",
    header: "Status",
    className: "w-32",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
