import { ListPlusIcon } from "lucide-react"

import type { AddonGroup } from "@/entities/menu-addon/model/menu-addon.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/ui/status-badge"
import { IconTile, TitleCell } from "@/shared/ui/table-cells"

const MAX_VISIBLE_OPTIONS = 3

export function describeSelection(group: Pick<AddonGroup, "is_required" | "max_select">): string {
  const choice =
    group.max_select === 1 ? "Pilih satu" : group.max_select > 1 ? `Pilih maks. ${group.max_select}` : "Pilih bebas"
  return `${choice} · ${group.is_required ? "Wajib" : "Opsional"}`
}

export const menuAddonColumns: CrudColumn<AddonGroup>[] = [
  {
    key: "name",
    header: "Grup Addon",
    render: (row) => (
      <TitleCell leading={<IconTile icon={ListPlusIcon} />} title={row.name} subtitle={describeSelection(row)} />
    ),
  },
  {
    key: "options",
    header: "Opsi",
    className: "whitespace-normal",
    render: (row) => {
      const options = row.options ?? []
      const visible = options.slice(0, MAX_VISIBLE_OPTIONS)
      return (
        <div className="flex flex-wrap gap-1.5">
          {visible.map((option) => (
            <span
              key={option.id}
              className="rounded-full bg-muted px-2.5 py-1 text-xs whitespace-nowrap text-foreground"
            >
              {option.name}
              {option.price > 0 && <span className="text-muted-foreground"> +{formatRupiah(option.price)}</span>}
            </span>
          ))}
          {options.length > visible.length && (
            <span className="px-1 py-1 text-xs text-muted-foreground">+{options.length - visible.length} lagi</span>
          )}
        </div>
      )
    },
  },
  {
    key: "menus",
    header: "Dipakai di",
    align: "right",
    className: "w-32 tabular-nums",
    render: (row) => (row.menu_ids?.length ? `${row.menu_ids.length} menu` : "—"),
  },
  {
    key: "status",
    header: "Status",
    className: "w-32",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
]
