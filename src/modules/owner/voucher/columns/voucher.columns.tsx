import type { Voucher } from "@/entities/voucher/model/voucher.types"
import {
  describeApiPeriod,
  describeValue,
} from "@/modules/owner/discount-form/lib/discount-rules"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/ui/status-badge"

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
      describeValue({
        type: row.type === "fixed" ? "fixed" : "percent",
        value: row.value ?? 0,
        maxDiscount: row.max_discount ?? 0,
      }),
  },
  {
    key: "minimum_purchase",
    header: "Min. Belanja",
    render: (row) => (row.minimum_purchase ? formatRupiah(row.minimum_purchase) : "—"),
  },
  {
    key: "period",
    header: "Periode",
    render: (row) => describeApiPeriod(row.start_date, row.end_date),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
