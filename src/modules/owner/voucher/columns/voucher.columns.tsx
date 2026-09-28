import { TicketIcon } from "lucide-react"

import type { Voucher } from "@/entities/voucher/model/voucher.types"
import {
  describeApiPeriod,
  describeValue,
} from "@/modules/owner/discount-form/lib/discount-rules"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/ui/status-badge"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

export const voucherColumns: CrudColumn<Voucher>[] = [
  {
    key: "name",
    header: "Voucher",
    render: (row) => (
      <TitleCell
        leading={<IconTile icon={TicketIcon} />}
        title={row.name}
        subtitle={<span className="font-mono tracking-wide">{row.code}</span>}
      />
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
    align: "right",
    className: "tabular-nums",
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
    className: "w-32",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
