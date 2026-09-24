import { GripVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { StatusBadge } from "@/shared/ui/status-badge"

// Edit/delete icons are decorative here — CrudSection already opens the
// edit dialog on row click (its Delete button lives in that dialog's
// footer), so these icons intentionally don't carry their own onClick and
// just let the click bubble up to the row.
export const menuCategoryColumns: CrudColumn<MenuCategory>[] = [
  {
    key: "sort_order",
    header: "Urutan",
    render: (row) => (
      <span className="flex items-center gap-2 text-muted-foreground">
        <GripVerticalIcon className="size-3.5" />
        {row.sort_order ?? 0}
      </span>
    ),
  },
  {
    key: "name",
    header: "Nama Kategori",
    render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
  },
  {
    key: "description",
    header: "Deskripsi",
    render: (row) => row.description || "—",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge active={row.status === "active"} />,
  },
  {
    key: "actions",
    header: "Aksi",
    render: () => (
      <div className="flex items-center gap-2">
        <span className="flex size-[30px] items-center justify-center rounded-full border text-muted-foreground">
          <PencilIcon className="size-3.5" />
        </span>
        <span className="flex size-[30px] items-center justify-center rounded-full border text-muted-foreground">
          <Trash2Icon className="size-3.5" />
        </span>
      </div>
    ),
  },
]
