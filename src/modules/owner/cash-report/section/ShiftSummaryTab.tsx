import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangleIcon, WalletIcon } from "lucide-react"

import { listCashiers } from "@/modules/owner/cashier/api/cashier.service"
import { useShiftCashList } from "@/modules/owner/cash-report/cash-report.queries"
import { shiftCashColumns } from "@/modules/owner/cash-report/columns/shift-cash.columns"
import { ShiftCashTransactionsSheet } from "@/modules/owner/cash-report/components/ShiftCashTransactionsSheet"
import { CrudTable } from "@/shared/ui/crud/CrudTable"
import { KpiCard } from "@/shared/ui/kpi-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

const ALL_CASHIERS = "all-cashiers"

interface ShiftSummaryTabProps {
  from: string
  to: string
}

// "Ringkasan Shift" tab — the full per-shift table (CashReportSection has 3
// more tabs: Rekap per Kasir, Tren Selisih, Anomali). Local state: `kasirId`
// (cashier filter, same <Select> + listCashiers() pattern as
// financial-report's TransactionsTab) and `selectedShiftId` (drives the
// drill-down Sheet — click any row to open it).
export function ShiftSummaryTab({ from, to }: ShiftSummaryTabProps) {
  const [kasirId, setKasirId] = useState<number | undefined>(undefined)
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)

  useEffect(() => {
    setSelectedShiftId(null)
  }, [from, to, kasirId])

  const { data: cashiers = [] } = useQuery({
    queryKey: ["cashiers", "all"],
    queryFn: () => listCashiers(1, 100),
  })

  const { data, isLoading, isError, refetch } = useShiftCashList({ from, to, kasirId })
  const rows = data ?? []

  // The row the owner clicked is already fully loaded — the Sheet only
  // fetches its transaction list, not the summary fields again.
  const selectedShift = rows.find((row) => row.shift_id === selectedShiftId) ?? null

  // Computed client-side from the already-fetched /shifts rows — no
  // separate fetch needed, this tab already has the full row set loaded.
  const anomalyCount = rows.filter((row) => row.is_anomaly).length

  return (
    <div className="flex flex-col gap-4">
      {!isLoading && !isError && (
        <KpiCard
          icon={AlertTriangleIcon}
          // Neutral when there's nothing to flag — same principle as
          // AnomaliesTab's zero-count empty state: an alarming red/amber
          // card for "0 anomali" would read backwards (0 is the healthy
          // outcome, not something to warn about).
          tone={anomalyCount > 0 ? "warning" : "default"}
          iconTone={anomalyCount > 0 ? "warning" : "neutral"}
          label="Shift dengan Selisih Tak Wajar"
          value={
            <>
              {anomalyCount} <span className="text-sm font-normal text-muted-foreground">Shift</span>
            </>
          }
          className="sm:max-w-sm"
        />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <Select
          value={kasirId != null ? String(kasirId) : ALL_CASHIERS}
          onValueChange={(value) => setKasirId(value === ALL_CASHIERS ? undefined : Number(value))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Kasir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CASHIERS}>Semua Kasir</SelectItem>
            {cashiers.map((cashier) => (
              <SelectItem key={cashier.id} value={String(cashier.id)}>
                {cashier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CrudTable
        columns={shiftCashColumns}
        rows={rows}
        getRowId={(row) => row.shift_id}
        isLoading={isLoading}
        isError={isError}
        errorHint="Laporan kas mungkin memerlukan paket Pro atau fitur tambahan Laporan."
        onRetry={() => refetch()}
        onRowClick={(row) => setSelectedShiftId(row.shift_id)}
        minWidth="min-w-[1080px]"
        empty={{
          icon: WalletIcon,
          title: "Belum ada shift",
          hint: "Tidak ada shift kasir pada rentang tanggal dan filter ini.",
        }}
      />

      <ShiftCashTransactionsSheet shift={selectedShift} onClose={() => setSelectedShiftId(null)} />
    </div>
  )
}
