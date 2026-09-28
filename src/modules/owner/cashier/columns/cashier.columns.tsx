import { CameraIcon } from "lucide-react"

import type { Cashier } from "@/entities/cashier/model/cashier.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { RowActionButton, RowActions } from "@/shared/ui/row-actions"
import { Switch } from "@/shared/ui/switch"
import { TitleCell } from "@/shared/ui/table-cells"
import { UserAvatar } from "@/shared/ui/user-avatar"

interface MakeCashierColumnsArgs {
  onToggleStatus: (row: Cashier) => void
  isToggling: boolean
  onOpenPhoto: (row: Cashier) => void
}

// A function (not a static array) because the status switch and the photo
// action need the section's callbacks — CrudColumn's `render` has no other
// way to reach outside the row.
export function makeCashierColumns({
  onToggleStatus,
  isToggling,
  onOpenPhoto,
}: MakeCashierColumnsArgs): CrudColumn<Cashier>[] {
  return [
    {
      key: "name",
      header: "Kasir",
      render: (row) => (
        <TitleCell
          leading={<UserAvatar name={row.name} src={row.photo} />}
          title={row.name}
          subtitle={`@${row.username}`}
        />
      ),
    },
    {
      key: "phone_no",
      header: "No. HP",
      render: (row) => row.phone_no || "—",
    },
    {
      key: "status",
      header: "Status",
      className: "w-40",
      render: (row) => {
        const active = row.status === "active"
        return (
          <label className="inline-flex items-center gap-2.5">
            <Switch
              checked={active}
              disabled={isToggling}
              onCheckedChange={() => onToggleStatus(row)}
              aria-label={`${active ? "Nonaktifkan" : "Aktifkan"} ${row.name}`}
              className="data-[state=checked]:bg-emerald-500"
            />
            <span className={active ? "text-sm font-semibold text-emerald-600" : "text-sm text-muted-foreground"}>
              {active ? "Aktif" : "Nonaktif"}
            </span>
          </label>
        )
      },
    },
    {
      key: "actions",
      header: "Aksi",
      className: "w-24",
      render: (row) => (
        <RowActions>
          <RowActionButton icon={CameraIcon} label={`Foto ${row.name}`} onClick={() => onOpenPhoto(row)} />
        </RowActions>
      ),
    },
  ]
}
