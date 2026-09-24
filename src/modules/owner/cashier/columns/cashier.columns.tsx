import type { Cashier } from "@/entities/cashier/model/cashier.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/ui/status-badge"

interface MakeCashierColumnsArgs {
  onToggleStatus: (row: Cashier) => void
  isToggling: boolean
}

// A function (not a static array) because the status-toggle button needs
// the mutation callback from the section that owns it — CrudColumn's
// `render` has no other way to reach outside the row.
export function makeCashierColumns({
  onToggleStatus,
  isToggling,
}: MakeCashierColumnsArgs): CrudColumn<Cashier>[] {
  return [
    {
      key: "name",
      header: "Nama",
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      key: "username",
      header: "Username",
    },
    {
      key: "phone_no",
      header: "No. HP",
      render: (row) => row.phone_no || "—",
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isToggling}
          onClick={(e) => {
            e.stopPropagation()
            onToggleStatus(row)
          }}
        >
          {row.status === "active" ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      ),
    },
  ]
}
