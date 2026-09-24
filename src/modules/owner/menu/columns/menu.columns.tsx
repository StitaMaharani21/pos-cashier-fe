import { PencilIcon, StarIcon, Trash2Icon } from "lucide-react"

import type { Menu } from "@/entities/menu/model/menu.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/ui/status-badge"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}

interface MenuColumnsArgs {
  onEdit: (row: Menu) => void
  onDelete: (row: Menu) => void
}

export function menuColumns({ onEdit, onDelete }: MenuColumnsArgs): CrudColumn<Menu>[] {
  return [
    {
      key: "name",
      header: "Menu",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt=""
              className="size-[38px] shrink-0 rounded-[10px] object-cover"
            />
          ) : (
            <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-[11px] font-bold text-primary">
              {getInitials(row.name ?? "")}
            </span>
          )}
          <span className="font-bold text-foreground">{row.name}</span>
        </div>
      ),
    },
    { key: "code", header: "Kode" },
    {
      key: "category_name",
      header: "Kategori",
      render: (row) => <span className="font-semibold text-primary">{row.category_name}</span>,
    },
    {
      key: "price",
      header: "Harga",
      render: (row) => <span className="font-bold text-foreground">{formatRupiah(row.price ?? 0)}</span>,
    },
    {
      key: "stock",
      header: "Stok",
      render: (row) => {
        if (row.stock_deduction_method === "by_ingredient") {
          return <span className="text-xs font-medium text-primary">Sesuai Resep</span>
        }
        if (row.stock_deduction_method === "by_menu") {
          const qty = row.stock_qty
          const critical = qty == null || qty <= 0
          return (
            <span className={cn("font-medium", critical && "font-bold text-destructive")}>
              {qty ?? 0}
            </span>
          )
        }
        return <span className="text-muted-foreground">—</span>
      },
    },
    {
      key: "preparation_time",
      header: "Estimasi",
      render: (row) => `${row.preparation_time ?? 0} menit`,
    },
    {
      key: "is_available",
      header: "Tersedia",
      render: (row) => <StatusBadge active={Boolean(row.is_available)} />,
    },
    {
      key: "is_featured",
      header: "Unggulan",
      render: (row) =>
        row.is_featured ? (
          <StarIcon className="size-[17px] fill-amber-400 text-amber-400" />
        ) : (
          <StarIcon className="size-[17px] text-muted-foreground/40" />
        ),
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
