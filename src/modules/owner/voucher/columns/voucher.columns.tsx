import { format } from "date-fns"

import type { Voucher } from "@/entities/voucher/model/voucher.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/ui/status-badge"

function formatDateRange(start?: string, end?: string): string {
  if (!start || !end) return "—"
  return `${format(new Date(start), "d MMM yyyy")} – ${format(new Date(end), "d MMM yyyy")}`
}

export const voucherColumns: CrudColumn<Voucher>[] = [
  {
    key: "name",
    header: "Nama Voucher",
    render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
  },
  {
    key: "code",
    header: "Kode",
    render: (row) => (
      <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{row.code}</span>
    ),
  },
  {
    key: "value",
    header: "Nilai",
    render: (row) =>
      row.type === "percent" ? `${row.value ?? 0}%` : formatRupiah(row.value ?? 0),
  },
  {
    key: "minimum_purchase",
    header: "Min. Belanja",
    render: (row) => (row.minimum_purchase ? formatRupiah(row.minimum_purchase) : "—"),
  },
  {
    key: "period",
    header: "Periode",
    render: (row) => formatDateRange(row.start_date, row.end_date),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
