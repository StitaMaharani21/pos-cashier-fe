import { format } from "date-fns"
import { LockIcon, PlusIcon, WalletIcon } from "lucide-react"

import type { DashboardShiftSummary } from "@/entities/order/model/order-analytics.types"
import type { CashSummaryShift } from "@/entities/shift/model/shift.types"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import type { CrudColumn } from "@/shared/api/crud/types"

interface PerCashierDrawersProps {
  shifts: CashSummaryShift[]
  // Sales of the same shifts (matched by shift_id); absent while still loading.
  sales?: DashboardShiftSummary[]
  onRecordCash: (shift: CashSummaryShift) => void
  onCount: (shift: CashSummaryShift) => void
  onClose: (shift: CashSummaryShift) => void
}

// "Per Kasir": every cashier has their own shift (their own opening cash, sales, cash in/out and
// drawer count), so with several shifts open the owner sees each one here and counts / closes
// each cashier's drawer separately. The cards above are the total of all of them.
export function PerCashierDrawers({ shifts, sales, onRecordCash, onCount, onClose }: PerCashierDrawersProps) {
  const salesOf = (shiftId: number) => sales?.find((row) => row.shift_id === shiftId)

  const columns: CrudColumn<CashSummaryShift>[] = [
    {
      key: "cashier",
      header: "Kasir",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.cashier_name || `Kasir #${row.user_id}`}</span>
          <span className="text-xs text-muted-foreground">Buka {format(new Date(row.opened_at), "HH:mm")}</span>
        </div>
      ),
    },
    {
      key: "sales",
      header: "Penjualan",
      align: "right",
      render: (row) => {
        const sale = salesOf(row.shift_id)
        return sale ? (
          <div className="flex flex-col items-end">
            <span className="tabular-nums">{formatRupiah(sale.total_revenue)}</span>
            <span className="text-xs text-muted-foreground">{sale.total_orders} pesanan</span>
          </div>
        ) : (
          "—"
        )
      },
    },
    { key: "opening", header: "Modal Awal", align: "right", render: (row) => <span className="tabular-nums">{formatRupiah(row.opening_balance)}</span> },
    {
      key: "expected",
      header: "Seharusnya Ada",
      align: "right",
      render: (row) => <span className="tabular-nums">{formatRupiah(row.current_expected_amount)}</span>,
    },
    {
      key: "counted",
      header: "Hasil Hitung",
      align: "right",
      render: (row) =>
        row.has_count ? (
          <div className="flex flex-col items-end">
            <span className="tabular-nums">{formatRupiah(row.counted_amount)}</span>
            {row.last_recorded_at && (
              <span className="text-xs text-muted-foreground">{format(new Date(row.last_recorded_at), "HH:mm")}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Belum dihitung</span>
        ),
    },
    {
      key: "movement",
      header: "Kas Masuk / Keluar",
      align: "right",
      render: (row) => (
        <div className="flex flex-col items-end text-xs tabular-nums">
          <span>Masuk {formatRupiah(row.cash_in)}</span>
          <span className="text-muted-foreground">Keluar {formatRupiah(row.cash_out)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onRecordCash(row)}>
            <PlusIcon />
            Catat Kas
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onCount(row)}>
            <WalletIcon />
            Hitung
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onClose(row)}>
            <LockIcon />
            Tutup
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section className="flex flex-col gap-3" data-testid="per-cashier-drawers">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Per Kasir</h2>
        <p className="text-xs text-muted-foreground">
          Setiap kasir punya sesi sendiri. Hitung dan tutup laci tiap kasir di sini; kartu di atas adalah jumlah semuanya.
        </p>
      </div>
      <CrudTable columns={columns} rows={shifts} getRowId={(row) => row.shift_id} minWidth="min-w-[960px]" />
    </section>
  )
}
