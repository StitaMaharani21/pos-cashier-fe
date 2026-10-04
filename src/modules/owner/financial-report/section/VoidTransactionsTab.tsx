import { AlertTriangleIcon, Undo2Icon } from "lucide-react"

import { ReportStateCard } from "@/modules/owner/financial-report/components/ReportStateCard"
import { useCancelledSummary } from "@/modules/owner/financial-report/financial-report.queries"
import type { CancelledByCashier } from "@/modules/owner/financial-report/financial-report.types"
import type { CrudColumn } from "@/shared/api/crud/types"
import { formatRupiah } from "@/shared/lib/utils"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { KpiCard } from "@/shared/ui/kpi-card"

const cancelledByCashierColumns: CrudColumn<CancelledByCashier>[] = [
  {
    key: "cashier_name",
    header: "Kasir",
    // cashier_id is null for cancellations the backend can't attribute to a
    // specific cashier — cashier_name is expected to already carry a human
    // label ("Sistem" or similar) for those rows, so this renders it
    // verbatim rather than special-casing null itself.
    render: (row) => <span className="font-medium text-foreground">{row.cashier_name || "—"}</span>,
  },
  {
    key: "count",
    header: "Jumlah Dibatalkan",
    align: "right",
    render: (row) => <span className="tabular-nums">{row.count} Order</span>,
  },
  {
    key: "value",
    header: "Nilai Dibatalkan",
    align: "right",
    render: (row) => (
      <span className="font-semibold tabular-nums text-destructive">{formatRupiah(row.value)}</span>
    ),
  },
]

// "Void/Batal" tab — the anti-fraud tab. A cashier cancelling orders (often
// after payment was already taken) is a common till-skimming pattern, so
// this deliberately does NOT read as a neutral metric: the summary cards use
// KpiCard's tone="warning"/iconTone="warning" (destructive-red border/icon
// chip + dot indicator, see shared/ui/kpi-card.tsx) instead of the
// primary/neutral tones every other tab uses, and the by-cashier breakdown
// is sorted by value desc so the biggest signal is always first. The one
// place this deliberately flips: 0 cancellations is a GOOD outcome, so that
// state uses ReportStateCard's default "muted" tone, never "danger" — an
// owner shouldn't see red just for having no fraud to report.
export function VoidTransactionsTab({ from, to }: { from: string; to: string }) {
  const query = useCancelledSummary({ from, to })

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-[141px] animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-[141px] animate-pulse rounded-xl border bg-muted/40" />
        </div>
        <div className="h-40 animate-pulse rounded-xl border bg-muted/40" />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <ReportStateCard
        tone="danger"
        title="Gagal memuat data transaksi dibatalkan"
        hint="Coba lagi beberapa saat lagi, atau ubah rentang tanggal."
        onRetry={() => query.refetch()}
      />
    )
  }

  const { total_count, total_value, by_cashier } = query.data

  if (total_count === 0) {
    return (
      <ReportStateCard
        title="Tidak ada transaksi dibatalkan pada periode ini"
        hint="Tidak ada indikasi pembatalan order pada rentang tanggal ini."
      />
    )
  }

  const sortedByCashier = [...by_cashier].sort((a, b) => b.value - a.value)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          icon={AlertTriangleIcon}
          tone="warning"
          iconTone="warning"
          label="Total Transaksi Dibatalkan"
          value={
            <>
              {total_count} <span className="text-sm font-normal text-muted-foreground">Order</span>
            </>
          }
        />
        <KpiCard
          icon={Undo2Icon}
          tone="warning"
          iconTone="warning"
          label="Total Nilai Dibatalkan"
          value={formatRupiah(total_value)}
        />
      </div>

      <CrudTable
        columns={cancelledByCashierColumns}
        rows={sortedByCashier}
        getRowId={(row) => row.cashier_id ?? row.cashier_name}
        empty={{
          icon: Undo2Icon,
          title: "Tidak ada rincian per kasir",
        }}
      />
    </div>
  )
}
