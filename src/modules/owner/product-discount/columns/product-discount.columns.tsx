import { format } from "date-fns"

import type { ProductDiscount } from "@/entities/product-discount/model/product-discount.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/ui/status-badge"

function formatDateRange(start?: string, end?: string): string {
  if (!start || !end) return "—"
  return `${format(new Date(start), "d MMM yyyy")} – ${format(new Date(end), "d MMM yyyy")}`
}

export const productDiscountColumns: CrudColumn<ProductDiscount>[] = [
  {
    key: "name",
    header: "Nama Diskon",
    render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
  },
  {
    key: "value",
    header: "Nilai",
    render: (row) =>
      row.type === "percent" ? `${row.value ?? 0}%` : formatRupiah(row.value ?? 0),
  },
  {
    key: "minimum_qty",
    header: "Min. Qty",
    render: (row) => row.minimum_qty ?? 0,
  },
  {
    key: "period",
    header: "Periode",
    render: (row) => formatDateRange(row.start_date, row.end_date),
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
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
