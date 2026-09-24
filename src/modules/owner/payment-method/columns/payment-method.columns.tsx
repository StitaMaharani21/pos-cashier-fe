import { PencilIcon, Trash2Icon } from "lucide-react"

import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.types"
import { TYPE_META } from "@/modules/owner/payment-method/constants/payment-type-meta"
import type { CrudColumn } from "@/shared/api/crud/types"
import { StatusBadge } from "@/shared/ui/status-badge"

interface PaymentMethodColumnsArgs {
  onEdit: (row: PaymentMethod) => void
  onDelete: (row: PaymentMethod) => void
}

export function paymentMethodColumns({
  onEdit,
  onDelete,
}: PaymentMethodColumnsArgs): CrudColumn<PaymentMethod>[] {
  return [
    {
      key: "name",
      header: "Metode",
      render: (row) => {
        const meta = TYPE_META[row.type ?? ""] ?? TYPE_META.cash
        const Icon = meta.icon
        return (
          <div className="flex items-center gap-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] text-white ${meta.className}`}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="font-bold text-foreground">{row.name}</span>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge active={row.status === "active"} />,
    },
    {
      key: "actions",
      header: "Aksi",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="flex size-[30px] items-center justify-center rounded-full border text-muted-foreground hover:text-foreground"
            aria-label="Edit"
          >
            <PencilIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="flex size-[30px] items-center justify-center rounded-full border text-muted-foreground hover:text-destructive"
            aria-label="Hapus"
          >
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      ),
    },
  ]
}
