import { BadgePercentIcon } from "lucide-react"

import type { ProductDiscount } from "@/entities/product-discount/model/product-discount.types"
import {
  describeApiPeriod,
  describeDays,
  describeHours,
  describeValue,
} from "@/modules/owner/discount-form/lib/discount-rules"
import type { CrudColumn } from "@/shared/api/crud/types"
import { StatusBadge } from "@/shared/ui/status-badge"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

export const productDiscountColumns: CrudColumn<ProductDiscount>[] = [
  {
    key: "name",
    header: "Diskon",
    render: (row) => (
      <TitleCell
        leading={<IconTile icon={BadgePercentIcon} />}
        title={row.name}
        subtitle={`${row.menus?.length ?? 0} menu`}
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
    key: "minimum_qty",
    header: "Min. Qty",
    align: "right",
    render: (row) => ((row.minimum_qty ?? 0) > 1 ? `${row.minimum_qty} item` : "—"),
  },
  {
    key: "period",
    header: "Periode",
    render: (row) => (
      <div className="flex flex-col">
        <span>{describeApiPeriod(row.start_date, row.end_date)}</span>
        {(row.active_days?.length || row.start_time) && (
          <span className="text-xs text-muted-foreground">
            {describeDays(row.active_days ?? [])} · {describeHours(row.start_time ?? "", row.end_time ?? "")}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "menus",
    header: "Menu",
    render: (row) => {
      const names = row.menus?.map((m) => m.menu_name).filter(Boolean) ?? []
      if (names.length === 0) return "—"
      const preview = names.slice(0, 2).join(", ")
      return names.length > 2 ? `${preview}, +${names.length - 2} lainnya` : preview
    },
  },
  {
    key: "status",
    header: "Status",
    className: "w-32",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
